// Recovers from stale-cache chunk load failures (typical in installed PWAs
// after a new deploy): drop caches + service worker, then reload once.

const RELOAD_FLAG = 'chunk_recovery_reloaded';

const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'error loading dynamically imported module',
  'unable to preload css',
];

function isChunkError(message: unknown): boolean {
  if (typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  return CHUNK_ERROR_PATTERNS.some((p) => lower.includes(p));
}

async function recover() {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(registrations.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(
        keys.filter((k) => /precache|runtime|workbox/i.test(k)).map((k) => caches.delete(k)),
      );
    }
  } catch {
    /* ignore */
  }

  window.location.reload();
}

export function setupChunkRecovery() {
  window.addEventListener('error', (event) => {
    if (isChunkError(event.message)) void recover();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: any = event.reason;
    if (isChunkError(typeof reason === 'string' ? reason : reason?.message)) void recover();
  });

  window.addEventListener('load', () => {
    sessionStorage.removeItem(RELOAD_FLAG);
  });
}
