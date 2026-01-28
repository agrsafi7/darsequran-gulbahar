import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AboutPreview() {
  // Fetch the About page content from the database
  const { data: aboutPage, isLoading } = useQuery({
    queryKey: ["about-page-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("title, content, meta_description")
        .eq("slug", "about")
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Extract a preview from the content (first ~300 characters of text, stripped of HTML)
  const getContentPreview = (htmlContent: string | null) => {
    if (!htmlContent) return null;
    
    // Strip HTML tags to get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    // Get first ~400 characters and trim at last complete word
    if (textContent.length <= 400) return textContent;
    
    const trimmed = textContent.substring(0, 400);
    const lastSpace = trimmed.lastIndexOf(" ");
    return trimmed.substring(0, lastSpace) + "...";
  };

  const contentPreview = getContentPreview(aboutPage?.content || null);

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              About Our Mission
            </div>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
              Spreading the Light of <span className="text-primary">Islamic Knowledge</span>
            </h2>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : contentPreview ? (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {contentPreview}
              </p>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to our Islamic Educational Platform, a dedicated space for seekers of 
                authentic Islamic knowledge. Our mission is to make the teachings of the Quran 
                and the wisdom of Islamic scholarship accessible to everyone.
              </p>
            )}

            <div className="pt-4">
              <Button asChild className="group">
                <Link to="/about">
                  Read More About Us
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Ad Placeholder - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AdPlaceholder size="vertical" location="sidebar" label="Sidebar Ad" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
