import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

async function hardReset() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(registrations.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
  window.location.reload();
}

// Shows a readable message instead of a blank/black screen when the app crashes.
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-6 max-w-md w-full text-center space-y-4 border border-white/20">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Something went wrong / Что-то пошло не так
          </h1>
          <p className="text-sm text-muted-foreground break-words">
            {error.message || 'Unknown error'}
          </p>
          <button
            onClick={() => void hardReset()}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            Reload / Перезагрузить
          </button>
        </div>
      </div>
    );
  }
}
