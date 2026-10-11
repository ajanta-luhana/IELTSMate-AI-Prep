export function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="container py-12 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {intro && <p className="mt-2 text-muted-foreground">{intro}</p>}
      </div>
      {children}
    </section>
  );
}
