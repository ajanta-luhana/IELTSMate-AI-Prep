import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/lib/api";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      <div className="h-32 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: ApiError | { message: string; code?: string }; onRetry?: () => void }) {
  const expired = error.code === "invalid_token" || error.code === "not_authenticated";
  return (
    <div className="space-y-3">
      <Alert variant="error">{error.message}</Alert>
      {expired ? (
        <Button asChild><Link href="/login">Sign in again</Link></Button>
      ) : onRetry ? (
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
