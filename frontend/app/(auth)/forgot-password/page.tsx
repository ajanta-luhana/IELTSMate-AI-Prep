import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Forgot your password?</h1>
      <p className="mb-6 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
      <ForgotForm />
    </>
  );
}
