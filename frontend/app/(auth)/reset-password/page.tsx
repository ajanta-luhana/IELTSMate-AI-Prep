import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Choose a new password</h1>
      <ResetForm />
    </>
  );
}
