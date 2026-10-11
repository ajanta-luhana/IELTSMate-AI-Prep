"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, signupSchema } from "@/lib/validation/auth";
import { useAuthForm } from "./use-auth-form";

export function SignupForm() {
  const router = useRouter();
  const [checkEmail, setCheckEmail] = useState(false);
  const { error, loading, onSubmit } = useAuthForm(signupSchema, async ({ name, email, password }) => {
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) return friendlyAuthError(error.message);
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
    } else {
      setCheckEmail(true); // email confirmation is enabled in Supabase
    }
    return null;
  });

  if (checkEmail) {
    return (
      <div className="space-y-4">
        <Alert variant="success">Account created! Check your email and click the confirmation link to start practicing.</Alert>
        <Link href="/login" className="text-sm text-primary hover:underline">Back to sign in</Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <Field label="Your name" name="name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" required />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create free account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
