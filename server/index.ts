import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initSentry, setupSentryMiddleware, setupSentryErrorHandler, captureException } from "./sentry";
import { config } from "./config";
import { ensureTranslationsExist } from "./seed-translations";
import { ensureCountriesExist } from "./seed-countries";
import { startNotificationScheduler, startTyphoonNotificationScheduler } from "./services/notification-scheduler";
import { startTyphoonPolling } from "./services/typhoon-monitor";
import { startHospitalPingScheduler } from "./services/hospital-ping-scheduler";
import { startDailyReportScheduler } from "./services/daily-report";
import fs from "fs";
import path from "path";
// Schema refresh trigger: 2025-12-03

const app = express();

// Track server readiness for health checks
let isReady = false;
const startTime = Date.now();

// FAST LIVENESS CHECK - responds immediately even during cold starts
// This endpoint is registered BEFORE any async initialization to minimize cold start latency
app.get('/livez', (_req, res) => {
  res.status(200).json({ 
    status: 'alive',
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

// Readiness check - only returns healthy when full initialization is complete
app.get('/readyz', (_req, res) => {
  if (isReady) {
    res.status(200).json({ 
      status: 'ready',
      uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  } else {
    res.status(503).json({ 
      status: 'initializing',
      uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  }
});

// Initialize Sentry first, before any other middleware
initSentry();

// Setup Sentry request and tracing handlers
setupSentryMiddleware(app);

// Enable trust proxy for accurate client IP tracking behind reverse proxies/CDNs
// Required for rate limiting to work correctly in production
app.set('trust proxy', true);

// Enable gzip compression for all responses (improves load time significantly)
app.use(compression({
  level: 6, // Balanced compression level (1-9, 6 is default)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept gzip
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use default filter for other cases
    return compression.filter(req, res);
  }
}));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Use Render's git commit hash as version identifier for cache busting
const BUILD_VERSION = process.env.RENDER_GIT_COMMIT || Date.now().toString();

// Smart caching strategy for optimal performance
app.use((req, res, next) => {
  const reqPath = req.path;
  
  // Check if file is in /assets/ directory (Vite's hashed output, e.g., /assets/index-7C31a2f4.js)
  // Vite uses mixed-case alphanumeric hashes, so we check for the /assets/ path pattern
  const isHashedAsset = reqPath.startsWith('/assets/') && /[-\.][A-Za-z0-9]{8,}\.(js|css|woff2?|ttf|eot)$/i.test(reqPath);
  
  // Check if this is likely an SPA route (no file extension, not an API route, not an asset)
  const isSpaRoute = !reqPath.startsWith('/api') && 
                     !reqPath.startsWith('/assets/') && 
                     !reqPath.match(/\.[a-zA-Z0-9]+$/);
  
  if (isHashedAsset) {
    // Hashed assets can be cached for 1 year (immutable)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (reqPath === '/' || reqPath.endsWith('.html') || isSpaRoute) {
    // HTML files and SPA routes should not be cached (to get latest JS/CSS references)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Build-Version', BUILD_VERSION);
  } else if (reqPath.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    // Images can be cached for 1 week
    res.setHeader('Cache-Control', 'public, max-age=604800');
  } else if (reqPath.match(/\.(js|css)$/i)) {
    // Non-hashed JS/CSS - short cache with revalidation
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // COLD START OPTIMIZATION: Run seeding in background (non-blocking)
  // This allows the server to start accepting requests faster
  ensureTranslationsExist()
    .then(() => log('[Startup] Translations seeded successfully'))
    .catch((err) => log(`[Startup] Translation seeding error (non-critical): ${err.message}`));
  
  ensureCountriesExist()
    .then(() => log('[Startup] Countries seeded successfully'))
    .catch((err) => log(`[Startup] Country seeding error (non-critical): ${err.message}`));
  
  const server = await registerRoutes(app);

  // Setup Sentry error handler AFTER routes but BEFORE other error handlers
  setupSentryErrorHandler(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (config.isDevelopment) {
    await setupVite(app, server);
  } else {
    // In production, intercept HTML requests and inject version into asset URLs
    // This bypasses Cloudflare's edge cache by creating unique URLs per deployment
    app.use((req, res, next) => {
      if (req.path === '/' || req.path.endsWith('.html')) {
        const distPath = path.resolve(import.meta.dirname, "public");
        const indexPath = path.resolve(distPath, "index.html");
        
        fs.readFile(indexPath, "utf-8", (err: any, html: string) => {
          if (err) {
            next();
            return;
          }
          
          // Inject version parameter into all JS and CSS asset URLs
          const versionedHtml = html
            .replace(
              /<script([^>]*)\ssrc="([^"?]+\.js)"/g,
              `<script$1 src="$2?v=${BUILD_VERSION}"`
            )
            .replace(
              /<link([^>]*)\shref="([^"?]+\.css)"/g,
              `<link$1 href="$2?v=${BUILD_VERSION}"`
            );
          
          res.setHeader('Content-Type', 'text/html');
          res.send(versionedHtml);
        });
      } else {
        next();
      }
    });
    
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  server.listen({
    port: config.port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${config.port}`);
    
    // Mark server as fully ready
    isReady = true;
    const startupTime = Date.now() - startTime;
    log(`[Startup] Server ready in ${startupTime}ms`);
    
    // COLD START OPTIMIZATION: Defer background services start by 2 seconds
    // This allows the server to respond to initial requests faster
    setTimeout(() => {
      startNotificationScheduler();
      log('[Startup] Notification scheduler started (deferred)');
      
      startTyphoonNotificationScheduler();
      log('[Startup] Typhoon notification queue scheduler started (every 30 seconds)');
      
      startTyphoonPolling();
      log('[Startup] Typhoon polling started (every 5 minutes)');
      
      startHospitalPingScheduler();
      log('[Startup] Hospital ping scheduler started (hourly ping + no-reply check)');

      startDailyReportScheduler();
      log('[Startup] Daily report scheduler started (fires at 08:00 HKT)');
    }, 2000);
  });
})();
