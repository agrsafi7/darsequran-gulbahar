import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
