"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, loginSchema } from "@/lib/validation/auth";
import { useAuthForm } from "./use-auth-form";

export function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const router = useRouter();
  const { error, loading, onSubmit } = useAuthForm(loginSchema, async (values) => {
    const { error } = await createClient().auth.signInWithPassword(values);
    if (error) return friendlyAuthError(error.message);
    router.replace(next);
    router.refresh();
    return null;
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {linkError && <Alert variant="warning">That link has expired or was already used. Please sign in or request a new one.</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        <Link href="/signup" className="text-primary hover:underline">Create account</Link>
      </div>
    </form>
  );
}
