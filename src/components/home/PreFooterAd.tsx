import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

export function PreFooterAd() {
  return (
    <section className="py-8 bg-secondary/20">
      <div className="container mx-auto px-4">
        <AdPlaceholder size="horizontal" label="Pre-Footer Banner Ad" />
      </div>
    </section>
  );
}
