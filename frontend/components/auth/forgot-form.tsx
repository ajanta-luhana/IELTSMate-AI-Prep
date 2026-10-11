"use client";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { forgotSchema, friendlyAuthError } from "@/lib/validation/auth";
import { useAuthForm } from "./use-auth-form";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const { error, loading, onSubmit } = useAuthForm(forgotSchema, async ({ email }) => {
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) return friendlyAuthError(error.message);
    setSent(true);
    return null;
  });

  if (sent) return <Alert variant="success">If an account exists for that email, a reset link is on its way.</Alert>;
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>
      <Link href="/login" className="block text-center text-sm text-primary hover:underline">Back to sign in</Link>
    </form>
  );
}
