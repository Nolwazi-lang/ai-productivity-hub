import { useCallback, useEffect, useState } from "react";

export const TONES = [
  "Professional",
  "Direct",
  "Warm",
  "Persuasive",
  "Apologetic",
  "Formal",
] as const;

export const AUDIENCES = [
  "Executive stakeholders",
  "Direct reports",
  "Cross-functional peers",
  "External client",
  "Vendor or partner",
  "Job candidate",
] as const;

export const LENGTHS = [
  "Short (under 100 words)",
  "Standard (100-180 words)",
  "Detailed (200+ words)",
] as const;

export const DEPTHS = [
  "Quick scan — orient me in 60 seconds",
  "Standard briefing — balanced depth",
  "Deep dive — thorough analysis",
] as const;

export type Preferences = {
  tone: string;
  audience: string;
  length: string;
  depth: string;
  workingHours: string;
};

export const DEFAULT_PREFERENCES: Preferences = {
  tone: TONES[0],
  audience: AUDIENCES[0],
  length: LENGTHS[1],
  depth: DEPTHS[1],
  workingHours: "09:00 - 17:00",
};

const STORAGE_KEY = "workplace-ai:preferences";

function read(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

const EVENT = "workplace-ai:preferences-changed";

/**
 * Reads saved defaults from local storage after hydration (SSR-safe) and keeps
 * every mounted consumer in sync when the settings page saves.
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPreferences(read());
    setLoaded(true);
    const sync = () => setPreferences(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next: Preferences) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    setPreferences(next);
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT));
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return { preferences, loaded, save, reset };
}
