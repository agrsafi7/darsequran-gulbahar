import { Layout } from "@/components/layout/Layout";
import { CategoryPostsList } from "@/components/shared/CategoryPostsList";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User } from "lucide-react";

const ScholarPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch the category details from dars_categories based on href
  const { data: category, isLoading } = useQuery({
    queryKey: ["dars-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dars_categories")
        .select("*")
        .eq("href", `/dars-e-quran/${slug}`)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="relative py-16 lg:py-24 hero-gradient overflow-hidden">
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
            <h1 className="font-heading text-3xl text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
            <Link to="/dars-e-quran" className="text-primary hover:underline">
              ← Back to Dars-e-Quran
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Link 
              to="/dars-e-quran" 
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dars-e-Quran
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 font-medium">
                Dars-e-Quran
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4 text-shadow-lg">
              {category.title}
            </h1>
            <p className="text-lg text-primary-foreground/90 text-shadow">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Posts List Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <CategoryPostsList
              category={category.title}
              emptyIcon={<User className="w-8 h-8 text-primary-foreground" />}
              emptyTitle="No Lessons Available"
              emptyMessage={`Check back soon for lessons from ${category.title}.`}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ScholarPage;
