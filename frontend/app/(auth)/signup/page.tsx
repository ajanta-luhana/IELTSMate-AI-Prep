import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-1 text-3xl font-semibold tracking-tight">Start practicing for free</h1>
      <p className="mb-6 text-sm text-muted-foreground">Create your account. It takes under a minute.</p>
      <SignupForm />
    </>
  );
}
