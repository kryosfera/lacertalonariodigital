import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Keep preview/iframe contexts free of stale PWA caches while preserving the
// installed-app experience on the live site.
(() => {
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app");

  const isPreviewContext = isPreviewHost || isInIframe;

  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (isPreviewContext) {
    const cacheResetKey = "__lovable_preview_cache_reset__";

    Promise.all([
      navigator.serviceWorker.getRegistrations().then(async (regs) => {
        await Promise.all(regs.map((registration) => registration.unregister()));
        return regs.length > 0 || Boolean(navigator.serviceWorker.controller);
      }),
      "caches" in window
        ? caches.keys().then(async (keys) => {
            await Promise.all(keys.map((key) => caches.delete(key)));
            return keys.length > 0;
          })
        : Promise.resolve(false),
    ])
      .then(([hadServiceWorker, hadCaches]) => {
        if ((hadServiceWorker || hadCaches) && !sessionStorage.getItem(cacheResetKey)) {
          sessionStorage.setItem(cacheResetKey, "1");
          window.location.reload();
          return;
        }

        sessionStorage.removeItem(cacheResetKey);
      })
      .catch(() => {});

    return;
  }

  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => {});
})();

createRoot(document.getElementById("root")!).render(<App />);
