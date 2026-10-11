"use client";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Profile } from "@/types/profile";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await api<Profile>("/auth/profile"));
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, "unknown_error", "Something went wrong."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, error, loading, reload: load };
}
