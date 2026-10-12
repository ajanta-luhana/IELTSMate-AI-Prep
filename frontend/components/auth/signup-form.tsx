"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, signupSchema } from "@/lib/validation/auth";
import { PasswordField } from "./password-field";
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
      <div className="space-y-5 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success"><MailCheck className="h-7 w-7" aria-hidden="true" /></span>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">We sent a confirmation link. Open it to activate your account and start practising.</p>
        </div>
        <Button asChild variant="outline" className="w-full"><Link href="/login">Back to sign in</Link></Button>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <Field label="Your name" name="name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <PasswordField label="Password" name="password" autoComplete="new-password" minLength={8} showStrength />
      <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create free account"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">By creating an account you agree that all scores are estimates and not official IELTS results.</p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
