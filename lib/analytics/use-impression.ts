"use client";

import { useEffect, useRef } from "react";

// Fire `onVisible` exactly once, the first time the attached element scrolls
// into view (≥40% visible). Powers CTA/email impression events so click and
// subscribe rates have a real denominator. Falls back to firing immediately
// where IntersectionObserver is unavailable. Returns a ref to attach.
export function useImpression<T extends HTMLElement>(onVisible: () => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onVisible);
  // Keep the latest callback without retriggering the observer effect.
  useEffect(() => {
    cb.current = onVisible;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      cb.current();
    };

    if (typeof IntersectionObserver === "undefined") {
      fire();
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            fire();
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
