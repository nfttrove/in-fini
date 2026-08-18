import { useCallback, useState } from "react";

/**
 * URL-backed panel state: the current parameters live in the URL query
 * string (?key=base64json) so any panel configuration is a shareable,
 * reproducible permalink. Malformed or non-numeric values in the URL are
 * ignored rather than crashing the panel. SSR-safe (no window at import
 * time on the server; renderToString tests exercise that path).
 */

function encodeState(obj: object): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/=+$/, "");
}

export function readUrlNumbers(key: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = new URLSearchParams(window.location.search).get(key);
    if (!raw) return {};
    const bin = atob(raw);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "number" && isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function usePanelUrlState<T extends object>(
  key: string,
  initial: T
): [T, (update: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => ({
    ...initial,
    ...readUrlNumbers(key),
  }));

  const set = useCallback(
    (update: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof update === "function" ? (update as (p: T) => T)(prev) : update;
        try {
          const url = new URL(window.location.href);
          url.searchParams.set(key, encodeState(next));
          window.history.replaceState(null, "", url);
        } catch {
          // no window / no history — state still works, sharing just degrades
        }
        return next;
      });
    },
    [key]
  );

  return [state, set];
}

export function writeUrlParam(key: string, value: string) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(null, "", url);
  } catch {
    // ignore
  }
}

export function readUrlParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(key);
  } catch {
    return null;
  }
}
