"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onAppInstalled = () => {
      track({ name: "pwa_installed", props: {} });
    };
    window.addEventListener("appinstalled", onAppInstalled);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const onLoad = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          /* swallow */
        });
      };
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);
  return null;
}
