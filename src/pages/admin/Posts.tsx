import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, CalendarIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  status: string;
  comments_enabled: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface DarsCategory {
  id: string;
  title: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [darsCategories, setDarsCategories] = useState<DarsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "",
    playlist_embed_url: "",
    archive_item_id: "",
    category: "",
    status: "draft",
    comments_enabled: true,
    published_at: null as Date | null,
  });
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a post title first to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImage(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ title: formData.title }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setFormData((prev) => ({ ...prev, featured_image: data.imageUrl }));
      toast({
        title: "Image Generated",
        description: "AI has created an Islamic-themed image for your post.",
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      const isPaymentError = error.message?.includes("Payment required") || error.message?.includes("credits");
      toast({
        title: "Generation Failed",
        description: isPaymentError 
          ? "AI credits unavailable. Please enter an image URL manually instead."
          : error.message || "Could not generate image. You can enter an image URL manually.",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const fetchData = async () => {
    try {
      const [postsRes, categoriesRes, darsCategoriesRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name")
          .order("sort_order", { ascending: true }),
        supabase
          .from("dars_categories")
          .select("id, title")
          .order("sort_order", { ascending: true }),
      ]);

      if (postsRes.error) throw postsRes.error;
      setPosts(postsRes.data || []);
      setCategories(categoriesRes.data || []);
      setDarsCategories(darsCategoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to fetch posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Determine published_at date
      let publishedAt: string | null = null;
      if (formData.status === "published") {
        if (formData.published_at) {
          // Use selected date
          publishedAt = formData.published_at.toISOString();
        } else if (editingPost?.published_at) {
          // Keep existing date when editing
          publishedAt = editingPost.published_at;
        } else {
          // Default to now for new posts
          publishedAt = new Date().toISOString();
        }
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featured_image: formData.featured_image || null,
        playlist_embed_url: formData.playlist_embed_url || null,
        archive_item_id: formData.archive_item_id || null,
        category: formData.category || null,
        status: formData.status,
        comments_enabled: formData.comments_enabled,
        published_at: publishedAt,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast({ title: "Success", description: "Post updated successfully" });
      } else {
        const { error } = await supabase.from("posts").insert(postData);

        if (error) throw error;
        toast({ title: "Success", description: "Post created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: Post & { playlist_embed_url?: string | null; archive_item_id?: string | null }) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      featured_image: post.featured_image || "",
      playlist_embed_url: post.playlist_embed_url || "",
      archive_item_id: post.archive_item_id || "",
      category: post.category || "",
      status: post.status,
      comments_enabled: post.comments_enabled,
      published_at: post.published_at ? new Date(post.published_at) : null,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Post deleted successfully" });
      fetchData();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image: "",
      playlist_embed_url: "",
      archive_item_id: "",
      category: "",
      status: "draft",
      comments_enabled: true,
      published_at: null,
    });
  };

  return (
    <AdminLayout title="Posts">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Posts</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Edit Post" : "Create New Post"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 && (
                          <>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {darsCategories.length > 0 && (
                          <>
                            {categories.length > 0 && (
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                                Scholars (Dars-e-Quran)
                              </div>
                            )}
                            {darsCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.title}>
                                {cat.title}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.published_at && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.published_at ? (
                          format(formData.published_at, "PPP")
                        ) : (
                          <span>Pick a date (optional)</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.published_at || undefined}
                        onSelect={(date) =>
                          setFormData((prev) => ({ ...prev, published_at: date || null }))
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Choose a past date to backdate or a future date to schedule.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="featured_image"
                      value={formData.featured_image}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          featured_image: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateImage}
                      disabled={generatingImage || !formData.title.trim()}
                      title="Generate Islamic-themed image using AI"
                    >
                      {generatingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Generate</span>
                    </Button>
                  </div>
                  {formData.featured_image && (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured preview" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter URL or click Generate to create an AI image based on the title.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playlist_embed_url">Playlist Embed URL (Optional)</Label>
                  <Input
                    id="playlist_embed_url"
                    value={formData.playlist_embed_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        playlist_embed_url: e.target.value,
                      }))
                    }
                    placeholder="https://soundcloud.com/... or YouTube playlist URL"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a SoundCloud, YouTube, or Spotify playlist URL to embed in the post.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="archive_item_id">Archive.org Item ID (Optional)</Label>
                  <Input
                    id="archive_item_id"
                    value={formData.archive_item_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        archive_item_id: e.target.value,
                      }))
                    }
                    placeholder="e.g., DoraTafseer2007"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the Archive.org item ID to display playlist, download list, and bulk download options.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    rows={2}
                    placeholder="Short description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, content }))
                    }
                    placeholder="Start writing your post content..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="comments_enabled"
                    checked={formData.comments_enabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, comments_enabled: checked }))
                    }
                  />
                  <Label htmlFor="comments_enabled">Enable comments</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPost ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No posts yet. Create your first post!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.category || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : 
                          post.status === "scheduled" ? "outline" : "secondary"
                        }
                        className={post.status === "scheduled" ? "border-primary text-primary" : ""}
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.comments_enabled ? "outline" : "secondary"}>
                        {post.comments_enabled ? "On" : "Off"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
