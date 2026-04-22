import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister stale service workers and clear caches in Lovable preview/iframe contexts
// to prevent the editor from showing outdated builds.
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

  if ((isPreviewHost || isInIframe) && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
