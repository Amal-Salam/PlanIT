'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Hydration-safe localStorage state.
 * - First render returns the initial value (matches the server).
 * - After mount, stored data replaces it; if nothing is stored, `initial` is used and saved.
 * - Nothing is written until hydrated, so stored data is never clobbered.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T | (() => T),
): readonly [T, Dispatch<SetStateAction<T>>, boolean] {
  const resolve = useCallback(
    () => (typeof initial === 'function' ? (initial as () => T)() : initial),
    [initial],
  );
  const [value, setValue] = useState<T>(resolve);
  const [hydrated, setHydrated] = useState(false);
  const skipNextWrite = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setValue(raw !== null ? (JSON.parse(raw) as T) : resolve());
    } catch {
      setValue(resolve());
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded or storage disabled: keep working in memory */
    }
  }, [key, value, hydrated]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        skipNextWrite.current = true;
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        skipNextWrite.current = false;
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue, hydrated] as const;
}
