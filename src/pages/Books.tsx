import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { BookOpen } from "lucide-react";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

const Books = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-10 lg:py-16 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
              Books
            </h1>
            <p className="text-xl text-primary-foreground/90 text-shadow">
              A curated collection of Islamic literature covering faith, jurisprudence, and spirituality
            </p>
          </div>
        </div>
      </section>

      {/* Books List with Sidebar */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 justify-center">
            {/* Main Content */}
            <div className="w-full max-w-2xl">
              <CategoryPostsList
                category="Books"
                emptyIcon={<BookOpen className="w-8 h-8 text-primary-foreground" />}
                emptyTitle="No Books Available"
                emptyMessage="Check back soon for Islamic literature and books."
              />
            </div>

            {/* Sidebar Ad */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <AdPlaceholder size="square" location="sidebar" label="Sidebar Ad" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Books;
