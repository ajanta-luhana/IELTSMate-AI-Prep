import { z } from "zod";

// Only public, browser-safe variables belong here.
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export function getEnv() {
  // Next inlines NEXT_PUBLIC_* only for literal property access, so list them explicitly.
  const parsed = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
  if (!parsed.success) {
    throw new Error("Missing or invalid environment variables. Copy .env.example to .env.local and fill it in.");
  }
  return parsed.data;
}
