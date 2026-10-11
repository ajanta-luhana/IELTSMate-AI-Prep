/** Hands a result from one page to the next (e.g. test → results). Per-tab, best effort. */
export function saveResult(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the results page will show a friendly fallback */
  }
}

export function loadResult<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
