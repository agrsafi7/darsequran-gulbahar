import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Folder } from "lucide-react";
import { trackContentView } from "@/lib/analytics";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

const SubcategoryPage = () => {
  const { scholarSlug, categorySlug } = useParams<{ scholarSlug: string; categorySlug: string }>();

  // Fetch the scholar (parent) details from dars_categories
  const { data: scholar, isLoading: scholarLoading } = useQuery({
    queryKey: ["dars-category", scholarSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dars_categories")
        .select("*")
        .eq("href", `/dars-e-quran/${scholarSlug}`)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!scholarSlug,
  });

  // Fetch the subcategory details from categories table
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!categorySlug,
  });

  // Track page view when category loads
  useEffect(() => {
    if (category && categorySlug) {
      trackContentView('subcategory', categorySlug, category.name);
    }
  }, [category, categorySlug]);

  const isLoading = scholarLoading || categoryLoading;

  if (isLoading) {
    return (
      <Layout>
        <section className="relative py-10 lg:py-16 hero-gradient overflow-hidden">
          <div className="absolute inset-0 pattern-bg opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Skeleton className="h-8 w-32 mb-4 bg-primary-foreground/20" />
              <Skeleton className="h-14 w-64 mb-4 bg-primary-foreground/20" />
              <Skeleton className="h-8 w-full max-w-xl bg-primary-foreground/20" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-heading text-3xl text-foreground mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
            <Link to={scholar ? `/dars-e-quran/${scholarSlug}` : "/dars-e-quran"} className="text-primary hover:underline">
              ← Go Back
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-10 lg:py-16 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Link 
              to={`/dars-e-quran/${scholarSlug}`}
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {scholar?.title || "Scholar"}
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Folder className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 font-medium">
                {scholar?.title || "Dars-e-Quran"}
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4 text-shadow-lg">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-primary-foreground/90 text-shadow">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Posts List Section with Sidebar */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-2xl">
              <CategoryPostsList
                category={category.name}
                emptyIcon={<Folder className="w-8 h-8 text-primary-foreground" />}
                emptyTitle="No Posts Available"
                emptyMessage={`Check back soon for posts in ${category.name}.`}
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

export default SubcategoryPage;
