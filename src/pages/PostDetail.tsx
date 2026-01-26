import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlaylistEmbed } from "@/components/shared/PlaylistEmbed";
import { ArchiveDownloadList } from "@/components/shared/ArchiveDownloadList";
import { ArchiveContent } from "@/components/shared/ArchiveContent";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  playlist_embed_url: string | null;
  archive_item_id: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

// Map categories to their respective URLs and labels
const categoryRoutes: Record<string, { url: string; label: string }> = {
  "Listen Online": { url: "/dars-e-quran/listen", label: "Listen Online" },
  "Download": { url: "/dars-e-quran/download", label: "Download Dars" },
  "Complete Dars": { url: "/dars-e-quran/complete", label: "Complete Dars" },
  "Speeches": { url: "/speeches", label: "Speeches" },
  "Books": { url: "/books", label: "Books" },
};

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Get the back route based on category
  const backRoute = post.category && categoryRoutes[post.category]
    ? categoryRoutes[post.category]
    : { url: "/posts", label: "Posts" };

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Layout>
      <article className="container py-12 max-w-3xl mx-auto">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to={backRoute.url}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {backRoute.label}
          </Link>
        </Button>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <Badge variant="secondary">{post.category}</Badge>
            )}
            {publishedDate && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {publishedDate}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          )}
        </header>

        {/* Archive.org Full Content (Playlist + Downloads + Bulk) */}
        {post.archive_item_id && (
          <div className="mb-8">
            <ArchiveContent itemId={post.archive_item_id} />
          </div>
        )}

        {/* Standalone Playlist Embed (when no archive_item_id but has playlist_embed_url) */}
        {!post.archive_item_id && post.playlist_embed_url && (
          <div className="mb-8">
            <PlaylistEmbed url={post.playlist_embed_url} />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <>
            {post.archive_item_id && <Separator className="my-8" />}
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </>
        )}
      </article>
    </Layout>
  );
}
