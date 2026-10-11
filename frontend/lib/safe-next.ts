/** Only allow same-site relative redirects (blocks open-redirect via ?next=). */
export function safeNext(value: string | undefined | null, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
