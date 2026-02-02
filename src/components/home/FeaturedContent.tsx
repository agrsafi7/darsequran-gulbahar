import { Link } from "react-router-dom";
import { BookOpen, Mic2, FileText, ArrowRight, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: BookOpen,
    title: "Dars-e-Quran",
    description: "Comprehensive Quran lessons with detailed tafseer and explanations for deeper understanding.",
    href: "/dars-e-quran",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Mic2,
    title: "Speeches",
    description: "Inspiring lectures and speeches on various Islamic topics by renowned scholars.",
    href: "/speeches",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: FileText,
    title: "Books",
    description: "A curated collection of Islamic literature covering faith, jurisprudence, and spirituality.",
    href: "/books",
    color: "bg-emerald-light text-primary",
  },
];

export function FeaturedContent() {
  // Fetch the recent_posts_categories setting
  const { data: categoriesSetting } = useQuery({
    queryKey: ["recent-posts-categories-setting"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "recent_posts_categories")
        .maybeSingle();

      if (error) throw error;
      return data?.value || "";
    },
  });

  // Parse categories from setting
  const targetCategories = categoriesSetting
    ? categoriesSetting.split(",").map(c => c.trim()).filter(Boolean)
    : [];

  // Fetch one post from each target category
  const { data: recentPosts, isLoading } = useQuery({
    queryKey: ["recent-posts-by-category", targetCategories],
    queryFn: async () => {
      if (targetCategories.length === 0) return [];

      const posts: Array<{
        id: string;
        title: string;
        slug: string;
        category: string;
        excerpt: string | null;
        featured_image: string | null;
        published_at: string | null;
        view_count?: number;
      }> = [];

      // Fetch one post from each category
      for (const category of targetCategories) {
        const { data } = await supabase
          .from("posts")
          .select("id, title, slug, category, excerpt, featured_image, published_at")
          .eq("status", "published")
          .eq("category", category)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          // Fetch view count for this post
          const { data: viewData } = await supabase
            .from("post_view_counts")
            .select("total_views")
            .eq("post_id", data.id)
            .maybeSingle();

          posts.push({
            ...data,
            view_count: viewData?.total_views || 0,
          });
        }
      }

      return posts;
    },
    enabled: targetCategories.length > 0,
  });

  const hasRecentPosts = recentPosts && recentPosts.length > 0;
  const showRecentPosts = targetCategories.length > 0 && (isLoading || hasRecentPosts);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Explore Our <span className="text-primary">Resources</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover a wealth of Islamic knowledge through our carefully organized categories
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link key={feature.title} to={feature.href} className="group">
              <Card className={cn(
                "card-elevated h-full border-0 overflow-hidden",
                "animate-slide-up"
              )} style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="pb-2">
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", feature.color)}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-primary font-medium text-sm">
                    Explore
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Posts - Only show if categories are configured and posts are available */}
        {showRecentPosts && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-2xl md:text-3xl text-foreground">Recent Posts</h3>
              <Button variant="outline" asChild>
                <Link to="/posts">View All Posts</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                [1, 2, 3].map((i) => (
                  <Card key={i} className="card-elevated h-full border-0 overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                recentPosts?.map((post, index) => (
                  <Link key={post.id} to={`/post/${post.slug}`} className="group">
                    <Card className={cn(
                      "card-elevated h-full border-0 overflow-hidden",
                      "animate-slide-up"
                    )} style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                      <div className="aspect-video overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No image</span>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {post.category && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {post.category}
                            </span>
                          )}
                          {post.published_at && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.published_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                          {post.view_count !== undefined && post.view_count > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              {post.view_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <CardTitle className="font-heading text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {post.excerpt || "Click to read more..."}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
