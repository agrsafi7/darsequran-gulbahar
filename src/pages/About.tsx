import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
}

const About = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", "about")
      .eq("status", "published")
      .maybeSingle();

    if (!error && data) {
      setPage(data);
    }
    setLoading(false);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
              {page?.title || "About Us"}
            </h1>
            {page?.meta_description && (
              <p className="text-xl text-primary-foreground/90 text-shadow">
                {page.meta_description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : page?.content ? (
                <div
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground">
                    Content coming soon. Please add content via the admin panel.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <AdPlaceholder size="vertical" label="Sidebar Ad" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
