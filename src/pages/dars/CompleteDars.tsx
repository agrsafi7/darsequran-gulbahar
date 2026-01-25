import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { FileAudio } from "lucide-react";

const CompleteDars = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <FileAudio className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 font-medium">
                Dars-e-Quran
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4 text-shadow-lg">
              Complete Dars
            </h1>
            <p className="text-lg text-primary-foreground/90 text-shadow">
              Download complete compilations as single files for uninterrupted listening experience.
            </p>
          </div>
        </div>
      </section>

      {/* Posts List Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <CategoryPostsList
              category="Complete Dars"
              emptyIcon={<FileAudio className="w-8 h-8 text-primary-foreground" />}
              emptyTitle="No Complete Dars Available"
              emptyMessage="Check back soon for complete Quran lesson compilations."
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CompleteDars;
