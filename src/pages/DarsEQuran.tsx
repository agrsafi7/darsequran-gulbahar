import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, Download, FileAudio, BookOpen, Mic, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Headphones,
  Download,
  FileAudio,
  BookOpen,
  Mic,
  Video,
};

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

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
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

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
              Choose How to Learn
            </h2>
            <p className="text-lg text-muted-foreground">
              Access our Quran lessons in the format that works best for you
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <CardContent />
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {categories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Headphones;
                return (
                  <Link key={category.id} to={category.href} className="group">
                    <Card 
                      className="card-elevated h-full border-0 text-center animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader>
                        <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4 group-hover:shadow-gold transition-shadow">
                          <IconComponent className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default DarsEQuran;
