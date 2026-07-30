import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdPlaceholder } from "./AdPlaceholder";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentSidebarProps {
  currentPostId?: string;
  currentCategory?: string | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  category: string | null;
  published_at: string | null;
}

export function ContentSidebar({ currentPostId, currentCategory }: ContentSidebarProps) {
  const { data: relatedPosts, isLoading } = useQuery({
    queryKey: ["related-posts", currentCategory, currentPostId],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, title, slug, featured_image, category, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5);

      // If we have a current post, exclude it
      if (currentPostId) {
        query = query.neq("id", currentPostId);
      }

      // If we have a category, filter by it for related posts
      if (currentCategory) {
        query = query.eq("category", currentCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // If no related posts in same category, fetch any recent posts
      if ((!data || data.length === 0) && currentCategory) {
        const fallbackQuery = supabase
          .from("posts")
          .select("id, title, slug, featured_image, category, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(5);

        if (currentPostId) {
          fallbackQuery.neq("id", currentPostId);
        }

        const { data: fallbackData } = await fallbackQuery;
        return fallbackData || [];
      }

      return data || [];
    },
  });

  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* Ad Placeholder */}
      <AdPlaceholder size="square" location="sidebar" label="Sidebar Ad" className="mx-auto" />

      {/* Related Posts */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">
            {currentCategory ? "Related Posts" : "Recent Posts"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </>
          ) : relatedPosts && relatedPosts.length > 0 ? (
            relatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="flex gap-3 group"
              >
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  {post.category && (
                    <span className="text-xs text-muted-foreground">
                      {post.category}
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No posts available</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
