import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { User, ChevronRight } from "lucide-react";

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

  // Fetch scholar categories from dars_categories
  const { data: scholars, isLoading: scholarsLoading } = useQuery({
    queryKey: ["dars-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dars_categories")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
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
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
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

      {/* Scholar Categories Section */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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
                    to={scholar.href}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {scholar.title}
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
        </div>
      </section>

      {/* Posts Section - Shows all Dars-e-Quran related posts */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
              All Dars-e-Quran Content
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse all Quran lessons and educational content
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <CategoryPostsList 
              category="Dars-e-Quran" 
              emptyTitle="No Content Available"
              emptyMessage="Check back soon for Dars-e-Quran lessons."
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DarsEQuran;
