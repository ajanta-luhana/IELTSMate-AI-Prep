import { cn } from "@/lib/utils";

type Variant = "error" | "success" | "warning" | "info";
const styles: Record<Variant, string> = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning-foreground",
  info: "border-primary/20 bg-primary/5 text-foreground",
};

export function Alert({ variant = "info", className, children }: { variant?: Variant; className?: string; children: React.ReactNode }) {
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("rounded-lg border px-4 py-3 text-sm", styles[variant], className)}>
      {children}
    </div>
  );
}
