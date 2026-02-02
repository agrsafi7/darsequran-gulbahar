import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: string | null;
  view_count?: number;
}

interface CategoryPostsListProps {
  category: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function CategoryPostsList({
  category,
  emptyIcon,
  emptyTitle = "No Posts Available",
  emptyMessage = "Check back soon for new content.",
}: CategoryPostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPosts = async () => {
      // Fetch posts that match the category exactly or contain the category name (for flexible matching)
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, featured_image, published_at, category")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false });

      if (!error && data) {
        // Filter posts where category matches exactly or contains key parts of the category name
        const categoryLower = category.toLowerCase();
        const filteredPosts = data.filter(post => {
          if (!post.category) return false;
          const postCategoryLower = post.category.toLowerCase();
          // Exact match or contains match
          return postCategoryLower === categoryLower || 
                 categoryLower.includes(postCategoryLower) ||
                 postCategoryLower.includes(categoryLower);
        });
        
        // Sort by published_at descending (newest first)
        const sortedPosts = filteredPosts.sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });

        // Fetch view counts for all posts
        const postIds = sortedPosts.map(p => p.id);
        const { data: viewCounts } = await supabase
          .from("post_view_counts")
          .select("post_id, total_views")
          .in("post_id", postIds);

        // Map view counts to posts
        const viewCountMap = new Map(viewCounts?.map(v => [v.post_id, v.total_views]) || []);
        const postsWithViews = sortedPosts.map(post => ({
          ...post,
          view_count: viewCountMap.get(post.id) || 0,
        }));
        
        setPosts(postsWithViews);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [category]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4">
          {emptyIcon || <FileText className="w-8 h-8 text-primary-foreground" />}
        </div>
        <h3 className="font-heading text-xl text-foreground mb-2">
          {emptyTitle}
        </h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/post/${post.slug}`}
          state={{ from: location.pathname }}
          className="block p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors group"
        >
          <div className="flex items-start gap-4">
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              {post.published_at && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {post.view_count !== undefined && post.view_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {post.view_count.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
