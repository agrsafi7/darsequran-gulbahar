import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, Download, FileAudio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  {
    title: "Listen Online Dars",
    description: "Stream Quran lessons directly in your browser. Access our complete library of audio recordings.",
    href: "/dars-e-quran/listen",
    icon: Headphones,
  },
  {
    title: "Download Dars",
    description: "Download individual lessons to listen offline. Perfect for learning on the go.",
    href: "/dars-e-quran/download",
    icon: Download,
  },
  {
    title: "Complete Dars (Single File)",
    description: "Download complete compilations as single files for uninterrupted listening experience.",
    href: "/dars-e-quran/complete",
    icon: FileAudio,
  },
];

const DarsEQuran = () => {
  const { data: page, isLoading } = useQuery({
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
            {isLoading ? (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <Link key={category.title} to={category.href} className="group">
                <Card 
                  className="card-elevated h-full border-0 text-center animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4 group-hover:shadow-gold transition-shadow">
                      <category.icon className="w-8 h-8 text-primary-foreground" />
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
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DarsEQuran;
