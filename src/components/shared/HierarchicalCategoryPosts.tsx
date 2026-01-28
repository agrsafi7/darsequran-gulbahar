import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  children?: Category[];
}

interface HierarchicalCategoryPostsProps {
  parentCategoryName: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function HierarchicalCategoryPosts({
  parentCategoryName,
  emptyIcon,
  emptyTitle = "No Posts Available",
  emptyMessage = "Check back soon for new content.",
}: HierarchicalCategoryPostsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      // First, find the parent category by name
      const { data: allCategories, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, sort_order")
        .order("sort_order", { ascending: true });

      if (catError || !allCategories) {
        setLoading(false);
        return;
      }

      // Find parent category that matches the scholar name
      const parentNameLower = parentCategoryName.toLowerCase();
      const parentCategory = allCategories.find(cat => 
        cat.name.toLowerCase().includes(parentNameLower) ||
        parentNameLower.includes(cat.name.toLowerCase())
      );

      if (!parentCategory) {
        // No matching parent category found, fall back to direct post matching
        setLoading(false);
        return;
      }

      // Get all child categories of this parent
      const childCategories = allCategories.filter(cat => cat.parent_id === parentCategory.id);
      
      // Build hierarchy
      const hierarchy: Category[] = childCategories.length > 0 
        ? childCategories 
        : [parentCategory]; // If no children, use parent itself

      setCategories(hierarchy);
      
      // Open all categories by default
      const allCatIds = new Set(hierarchy.map(c => c.id));
      setOpenCategories(allCatIds);

      // Fetch all published posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, featured_image, published_at, category")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false });

      if (!postsError && postsData) {
        setPosts(postsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [parentCategoryName]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getPostsForCategory = (categoryName: string) => {
    const catNameLower = categoryName.toLowerCase();
    return posts.filter(post => {
      if (!post.category) return false;
      const postCategoryLower = post.category.toLowerCase();
      return postCategoryLower === catNameLower || 
             catNameLower.includes(postCategoryLower) ||
             postCategoryLower.includes(catNameLower);
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="pl-4 space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Check if there are any posts across all categories
  const totalPosts = categories.reduce((acc, cat) => acc + getPostsForCategory(cat.name).length, 0);
  
  // Also check direct posts matching parent category name
  const directPosts = getPostsForCategory(parentCategoryName);

  if (categories.length === 0 && directPosts.length === 0) {
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

  // If no subcategories, show direct posts
  if (categories.length === 0 && directPosts.length > 0) {
    return (
      <div className="space-y-3">
        {directPosts.map((post) => (
          <PostCard key={post.id} post={post} location={location} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryPosts = getPostsForCategory(category.name);
        const isOpen = openCategories.has(category.id);
        
        return (
          <Collapsible
            key={category.id}
            open={isOpen}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg hero-gradient flex items-center justify-center flex-shrink-0">
                  {isOpen ? (
                    <FolderOpen className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Folder className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-heading text-lg text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {categoryPosts.length} {categoryPosts.length === 1 ? 'post' : 'posts'}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 ml-4 pl-4 border-l-2 border-border space-y-3">
                {categoryPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No posts in this category yet.
                  </p>
                ) : (
                  categoryPosts.map((post) => (
                    <PostCard key={post.id} post={post} location={location} />
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Also show any direct posts that don't match subcategories */}
      {directPosts.length > 0 && categories.length > 0 && (
        <div className="mt-6">
          <h4 className="font-heading text-lg text-foreground mb-3">Other Posts</h4>
          <div className="space-y-3">
            {directPosts
              .filter(post => !categories.some(cat => 
                getPostsForCategory(cat.name).some(p => p.id === post.id)
              ))
              .map((post) => (
                <PostCard key={post.id} post={post} location={location} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, location }: { post: Post; location: ReturnType<typeof useLocation> }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      state={{ from: location.pathname }}
      className="block p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors group"
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
            <span className="text-xs text-muted-foreground mt-2 block">
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
