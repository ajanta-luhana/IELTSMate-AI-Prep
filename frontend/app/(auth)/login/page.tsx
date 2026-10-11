import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mb-6 text-sm text-muted-foreground">Sign in to continue your practice.</p>
      <LoginForm next={safeNext(next)} linkError={error === "link"} />
    </>
  );
}
