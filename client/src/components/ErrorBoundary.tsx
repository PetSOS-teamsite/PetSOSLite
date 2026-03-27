import { Component, ReactNode } from 'react';
import { Sentry } from '@/lib/sentry';
import { RefreshCw, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isRecovering: boolean;
  recoveryAttempted: boolean;
  countdown: number;
}

// Detect if error is caused by stale cache/bundle issues (strict patterns only)
function isStaleCacheError(error: Error): boolean {
  const message = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  // Strict patterns that indicate stale bundle/cache issues
  const staleCachePatterns = [
    'text/html',                    // Server returning HTML instead of JS
    'mime type',                    // MIME type mismatch
    'loading chunk',                // Webpack chunk loading failure
    'loading css chunk',            // CSS chunk loading failure
    'dynamically imported module',  // Dynamic import failure
    'failed to fetch dynamically',  // Dynamic import network failure
    'chunkloaderror',               // Explicit chunk load error
  ];
  
  // Check error name for chunk errors
  if (errorName === 'chunkloaderror') {
    return true;
  }
  
  return staleCachePatterns.some(pattern => message.includes(pattern));
}

// Check if we've already attempted recovery this session
function hasAttemptedRecovery(): boolean {
  try {
    return sessionStorage.getItem('petsos_recovery_attempted') === 'true';
  } catch {
    return false;
  }
}

function markRecoveryAttempted(): void {
  try {
    sessionStorage.setItem('petsos_recovery_attempted', 'true');
  } catch {}
}

// Clear all caches and service workers
async function clearAllCaches(): Promise<void> {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Clear localStorage cache markers
    try {
      localStorage.removeItem('petsos_cache_version');
    } catch {}
  } catch (e) {
    console.warn('[ErrorBoundary] Cache clear failed:', e);
  }
}

// Force reload with cache busting
function forceReload(): void {
  const url = new URL(window.location.href);
  url.searchParams.set('_refresh', Date.now().toString());
  window.location.replace(url.toString());
}

export class ErrorBoundary extends Component<Props, State> {
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      isRecovering: false,
      recoveryAttempted: false,
      countdown: 3,
    };
  }

  componentDidMount() {
    // If already in error state on mount (shouldn't happen, but guard)
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    // Start auto-reload countdown when error is first shown
    if (this.state.hasError && !prevState.hasError && !this.state.isRecovering) {
      this.startAutoReloadCountdown();
    }
  }

  componentWillUnmount() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  startAutoReloadCountdown() {
    this.setState({ countdown: 3 });
    this.countdownTimer = setInterval(() => {
      this.setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(this.countdownTimer!);
          this.handleManualRetry();
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isStaleCache = isStaleCacheError(error);
    
    // Log error to Sentry with cache context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        stale_cache: isStaleCache ? 'true' : 'false',
      },
    });

    // Auto-recover from stale cache errors (only once per session)
    if (isStaleCache && !this.state.recoveryAttempted && !hasAttemptedRecovery()) {
      this.attemptAutoRecovery();
    }
  }

  attemptAutoRecovery = async () => {
    markRecoveryAttempted();
    this.setState({ isRecovering: true, recoveryAttempted: true });
    
    try {
      await clearAllCaches();
      // Small delay to ensure caches are cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      forceReload();
    } catch {
      this.setState({ isRecovering: false });
    }
  };

  handleManualRetry = async () => {
    this.setState({ isRecovering: true });
    await clearAllCaches();
    forceReload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, isRecovering: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show recovery spinner if auto-recovering
      if (this.state.isRecovering) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Reloading emergency tools...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              正在重新載入...
            </p>
          </div>
        );
      }

      // Emergency-friendly fallback (no technical jargon)
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          <Card className="max-w-md w-full border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-xl text-blue-700 dark:text-blue-400">
                Reloading{this.state.countdown > 0 ? ` in ${this.state.countdown}…` : '…'}
              </CardTitle>
              <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
                {this.state.countdown > 0 ? `${this.state.countdown} 秒後自動重新載入…` : '正在重新載入…'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Primary action - Reload now */}
              <Button 
                onClick={this.handleManualRetry} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg"
                data-testid="button-reload"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reload Now / 立即重新載入
              </Button>

              {/* Secondary action - Go Home */}
              <Button 
                onClick={() => {
                  clearAllCaches().then(() => {
                    window.location.href = '/';
                  });
                }} 
                variant="outline"
                className="w-full h-12"
                data-testid="button-home"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home 返回主頁
              </Button>

            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
