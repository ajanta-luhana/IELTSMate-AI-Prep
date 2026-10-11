"use client";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, resetSchema } from "@/lib/validation/auth";
import { useAuthForm } from "./use-auth-form";

export function ResetForm() {
  const router = useRouter();
  const { error, loading, onSubmit } = useAuthForm(resetSchema, async ({ password }) => {
    const { error } = await createClient().auth.updateUser({ password });
    if (error) return friendlyAuthError(error.message);
    router.replace("/dashboard");
    router.refresh();
    return null;
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
