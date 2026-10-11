import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email").email("Enter a valid email address");
const password = z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long");

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") });
export const forgotSchema = z.object({ email });
export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80, "Name is too long"),
    email,
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

/** Turn Supabase's technical messages into friendly ones. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("already registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("fetch") || m.includes("network")) return "Can't reach the sign-in service. Check your connection and Supabase settings.";
  return message;
}
