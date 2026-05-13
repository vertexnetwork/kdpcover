"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const STORAGE_KEY = `${siteConfig.shortName}-consent-v1`;

type ConsentState = "unknown" | "granted" | "denied";

type ConsentValue = {
  /** True only when consent has been explicitly granted (or consent is not required). */
  allowed: boolean;
  state: ConsentState;
  grant: () => void;
  deny: () => void;
};

const ConsentContext = createContext<ConsentValue>({
  allowed: true,
  state: "granted",
  grant: () => {},
  deny: () => {},
});

export function ConsentProvider({
  required,
  children,
}: {
  required: boolean;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ConsentState>(required ? "unknown" : "granted");

  useEffect(() => {
    if (!required) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "granted" || stored === "denied") setState(stored);
    } catch {
      /* no-op */
    }
  }, [required]);

  const grant = useCallback(() => {
    setState("granted");
    try {
      window.localStorage.setItem(STORAGE_KEY, "granted");
    } catch {
      /* no-op */
    }
  }, []);

  const deny = useCallback(() => {
    setState("denied");
    try {
      window.localStorage.setItem(STORAGE_KEY, "denied");
    } catch {
      /* no-op */
    }
  }, []);

  const value = useMemo<ConsentValue>(
    () => ({ allowed: !required || state === "granted", state, grant, deny }),
    [required, state, grant, deny],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentValue {
  return useContext(ConsentContext);
}
