import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { User, ChevronRight } from "lucide-react";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

const DarsEQuran = () => {
  const { data: page, isLoading: pageLoading } = useQuery({
    queryKey: ["page", "dars-e-quran"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", "dars-e-quran")
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch scholar categories from categories table (children of Dars-e-Quran)
  const { data: scholars, isLoading: scholarsLoading } = useQuery({
    queryKey: ["dars-e-quran-scholars"],
    queryFn: async () => {
      // First find the Dars-e-Quran parent category
      const { data: allCategories, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!allCategories) return [];

      // Find the Dars-e-Quran parent category
      const darsParent = allCategories.find(cat => cat.slug === "dars-e-quran");
      if (!darsParent) return [];

      // Get direct children (scholars) of Dars-e-Quran
      return allCategories.filter(cat => cat.parent_id === darsParent.id);
    },
  });

  // Extract plain text from HTML content for description
  const getDescription = () => {
    if (!page?.content) {
      return "Comprehensive Quran lessons with detailed tafseer and explanations for deeper understanding";
    }
    const div = document.createElement("div");
    div.innerHTML = page.content;
    return div.textContent || div.innerText || "";
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-10 lg:py-16 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            {pageLoading ? (
              <>
                <Skeleton className="h-14 w-64 mb-6 bg-primary-foreground/20" />
                <Skeleton className="h-8 w-full max-w-xl bg-primary-foreground/20" />
              </>
            ) : (
              <>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
                  {page?.title || "Dars-e-Quran"}
                </h1>
                <p className="text-xl text-primary-foreground/90 text-shadow">
                  {getDescription()}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Scholar Categories Section with Sidebar */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 justify-center">
            {/* Main Content */}
            <div className="w-full max-w-2xl">
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
                Browse by Scholar
              </h2>
              {scholarsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : scholars && scholars.length > 0 ? (
                <div className="space-y-3">
                  {scholars.map((scholar) => (
                    <Link
                      key={scholar.id}
                      to={`/dars-e-quran/${scholar.slug}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {scholar.name}
                          </h3>
                          {scholar.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {scholar.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No scholars available yet.</p>
              )}
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

export default DarsEQuran;
