"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";

/** GET a backend path with loading/error state. Pass null to skip fetching. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const latest = useRef(0);

  const load = useCallback(async () => {
    if (path === null) return;
    const id = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await api<T>(path);
      if (id === latest.current) setData(result);
    } catch (e) {
      if (id === latest.current) setError(e instanceof ApiError ? e : new ApiError(0, "unknown_error", "Something went wrong."));
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, reload: load };
}
