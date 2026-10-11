import { createClient } from "@/lib/supabase/client";
import { getEnv } from "@/lib/env";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Typed fetch wrapper: attaches the user's Supabase JWT and normalises errors. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await createClient().auth.getSession();
  const headers = new Headers(init.headers);
  if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${getEnv().NEXT_PUBLIC_API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "network_error", "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Partial<ApiErrorBody> | null;
    throw new ApiError(res.status, body?.code ?? "unknown_error", body?.message ?? "Something went wrong.");
  }
  return (await res.json()) as T;
}
