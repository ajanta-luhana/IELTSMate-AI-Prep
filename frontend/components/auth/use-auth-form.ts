"use client";
import { useState } from "react";
import type { ZodType } from "zod";

/** Shared submit logic: zod validation → async action → loading/error state. */
export function useAuthForm<T>(schema: ZodType<T>, action: (values: T) => Promise<string | null>) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setLoading(true);
    try {
      setError(await action(parsed.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return { error, loading, onSubmit, setError };
}
