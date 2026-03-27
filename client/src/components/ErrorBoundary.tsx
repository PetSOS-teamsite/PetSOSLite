import { Component, ReactNode } from 'react';
import { Sentry } from '@/lib/sentry';
import { RefreshCw, Home, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isStaleCache: boolean;
  isReloading: boolean;
  countdown: number;
}

function isStaleCacheError(error: Error): boolean {
  const message = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  const staleCachePatterns = [
    'text/html',
    'mime type',
    'loading chunk',
    'loading css chunk',
    'dynamically imported module',
    'failed to fetch dynamically',
    'chunkloaderror',
  ];
  if (errorName === 'chunkloaderror') return true;
  return staleCachePatterns.some(pattern => message.includes(pattern));
}

async function clearAllCaches(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    try { localStorage.removeItem('petsos_cache_version'); } catch {}
  } catch (e) {
    console.warn('[ErrorBoundary] Cache clear failed:', e);
  }
}

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
      isStaleCache: false,
      isReloading: false,
      countdown: 3,
    };
  }

  componentWillUnmount() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, isStaleCache: isStaleCacheError(error) };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
      tags: { stale_cache: isStaleCacheError(error) ? 'true' : 'false' },
    });

    if (isStaleCacheError(error)) {
      this.startCountdown();
    }
  }

  startCountdown() {
    this.setState({ countdown: 3 });
    this.countdownTimer = setInterval(() => {
      this.setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(this.countdownTimer!);
          this.doReload();
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  doReload = async () => {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.setState({ isReloading: true });
    await clearAllCaches();
    forceReload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    // Stale cache error — show calming "almost there" screen with auto-countdown
    if (this.state.isStaleCache) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
          <Card className="max-w-md w-full border-blue-200 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <RefreshCw className={`h-14 w-14 text-blue-500 ${this.state.isReloading ? 'animate-spin' : ''}`} />
              </div>
              <CardTitle className="text-2xl text-blue-700">
                Almost there!
              </CardTitle>
              <CardTitle className="text-lg text-gray-500 font-medium">
                快完成了！
              </CardTitle>
              <CardDescription className="mt-3 text-base text-gray-600">
                {this.state.isReloading
                  ? 'Reloading… 正在重新載入…'
                  : `Auto-reloading in ${this.state.countdown}s… / ${this.state.countdown} 秒後自動重新載入…`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Your data is safe!</p>
                  <p className="text-sm text-green-600">您的資料已安全保存！</p>
                </div>
              </div>

              <Button
                onClick={this.doReload}
                disabled={this.state.isReloading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
                data-testid="button-reload"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${this.state.isReloading ? 'animate-spin' : ''}`} />
                {this.state.isReloading ? 'Reloading… 重新載入中…' : 'Reload Now / 立即重新載入'}
              </Button>

              <Button
                onClick={() => { clearAllCaches().then(() => { window.location.href = '/'; }); }}
                variant="outline"
                className="w-full h-10"
                data-testid="button-home"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home / 返回主頁
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Generic error fallback
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-50 to-white">
        <Card className="max-w-md w-full border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-700">Something went wrong</CardTitle>
            <CardTitle className="text-lg text-gray-500 font-medium">發生錯誤</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={this.doReload}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
              data-testid="button-reload"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again / 重試
            </Button>
            <Button
              onClick={() => { window.location.href = '/'; }}
              variant="outline"
              className="w-full h-10"
              data-testid="button-home"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home / 返回主頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
