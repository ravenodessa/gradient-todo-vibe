// Guarded service-worker registration.
// The SW is only allowed in the real published app — never in dev, iframes
// or Lovable preview hosts, where a stale precache breaks the app shell.

const SW_URL = '/sw.js';

function isPreviewHost(hostname: string): boolean {
  return (
    hostname.startsWith('id-preview--') ||
    hostname.startsWith('preview--') ||
    hostname === 'lovableproject.com' ||
    hostname.endsWith('.lovableproject.com') ||
    hostname === 'lovableproject-dev.com' ||
    hostname.endsWith('.lovableproject-dev.com') ||
    hostname === 'beta.lovable.dev' ||
    hostname.endsWith('.beta.lovable.dev')
  );
}

async function unregisterAppServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registrations
        .filter((r) => {
          const url = r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || '';
          return url.endsWith(SW_URL);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* ignore */
  }
}

export function setupPWA() {
  if (!('serviceWorker' in navigator)) return;

  const isIframe = window.self !== window.top;
  const swOff = new URLSearchParams(window.location.search).get('sw') === 'off';

  if (!import.meta.env.PROD || isIframe || swOff || isPreviewHost(window.location.hostname)) {
    void unregisterAppServiceWorkers();
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch(() => {
      /* registration failures must never break the app */
    });
  });
}
