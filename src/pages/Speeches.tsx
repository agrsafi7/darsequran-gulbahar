import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { Mic } from "lucide-react";

const Speeches = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
              Speeches
            </h1>
            <p className="text-xl text-primary-foreground/90 text-shadow">
              Inspiring lectures and speeches on various Islamic topics by renowned scholars
            </p>
          </div>
        </div>
      </section>

      {/* Speeches List */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <CategoryPostsList
              category="Speeches"
              emptyIcon={<Mic className="w-8 h-8 text-primary-foreground" />}
              emptyTitle="No Speeches Available"
              emptyMessage="Check back soon for inspiring lectures and speeches."
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Speeches;
