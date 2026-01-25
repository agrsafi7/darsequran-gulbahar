import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published_at: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [postsRes, categoriesRes] = await Promise.all([
      supabase
        .from("posts")
        .select("id, title, slug, category, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true }),
    ]);

    if (postsRes.data) setPosts(postsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    
    setLoading(false);
  };

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  const groupedPosts = categories.reduce((acc, category) => {
    const categoryPosts = posts.filter((post) => post.category === category.name);
    if (categoryPosts.length > 0) {
      acc[category.name] = categoryPosts;
    }
    return acc;
  }, {} as Record<string, Post[]>);

  // Add uncategorized posts
  const uncategorizedPosts = posts.filter(
    (post) => !post.category || !categories.some((cat) => cat.name === post.category)
  );
  if (uncategorizedPosts.length > 0) {
    groupedPosts["Uncategorized"] = uncategorizedPosts;
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-4xl font-heading font-bold mb-8">Posts</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedCategory ? (
          // Filtered view - show flat list
          <div className="space-y-2">
            {filteredPosts.length === 0 ? (
              <p className="text-muted-foreground">No posts in this category.</p>
            ) : (
              filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.slug}`}
                  className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-foreground hover:text-primary transition-colors">
                    {post.title}
                  </span>
                </Link>
              ))
            )}
          </div>
        ) : (
          // Grouped view - show by category
          <div className="space-y-8">
            {Object.entries(groupedPosts).map(([categoryName, categoryPosts]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">{categoryName}</Badge>
                    <span className="text-muted-foreground text-sm font-normal">
                      ({categoryPosts.length} posts)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {categoryPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={`/post/${post.slug}`}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
            {Object.keys(groupedPosts).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No published posts yet.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
