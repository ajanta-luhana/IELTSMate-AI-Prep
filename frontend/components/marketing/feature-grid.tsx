import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURES } from "@/lib/marketing-content";

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ title, text, icon: Icon }) => (
        <Card key={title} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{text}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}
