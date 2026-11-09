import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon, ArrowLeft, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchPostCategories } from "./postQueries";
import { emptyPostForm, generatePostSlug, postPayload, postToForm, type Post, type PostForm } from "./postModel";

function EditorBox({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border border-border bg-card"><h2 className="admin-panel-heading">{title}</h2><div className="p-4 space-y-4">{children}</div></section>;
}

export default function PostEditor() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ["admin-post", id], enabled: Boolean(id), queryFn: async () => {
    const result = await supabase.from("posts").select("*").eq("id", id ?? "").single();
    if (result.error) throw result.error;
    return result.data;
  } });
  return <AdminLayout title={id ? "Edit Post" : "Add New Post"}>
    {id && query.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : id && query.error ? <div role="alert" className="space-y-4"><p className="text-destructive">Unable to load this post.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> :
      <PostEditorForm key={id ?? "new"} post={query.data} />}
  </AdminLayout>;
}

function PostEditorForm({ post }: { post?: Post }) {
  const [form, setForm] = useState<PostForm>(() => post ? postToForm(post) : { ...emptyPostForm });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const categoriesQuery = useQuery({ queryKey: ["admin-post-categories"], queryFn: fetchPostCategories });
  const categories = Array.from(new Set([...(categoriesQuery.data?.categories.map(c => c.name) ?? []), ...(categoriesQuery.data?.scholars.map(c => c.title) ?? []), ...(form.category ? [form.category] : [])]));
  const update = <K extends keyof PostForm>(key: K, value: PostForm[K]) => setForm(previous => ({ ...previous, [key]: value }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = postPayload(form);
      const result = post ? await supabase.from("posts").update(payload).eq("id", post.id) : await supabase.from("posts").insert(payload);
      if (result.error) throw result.error;
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", post?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
      toast({ title: post ? "Post updated successfully" : "Post created successfully" });
      navigate("/admin/posts");
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save post", variant: "destructive" });
    } finally { setSaving(false); }
  };
  const generateImage = async () => {
    if (!form.title.trim()) return;
    setGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post-image`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` }, body: JSON.stringify({ title: form.title }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image generation unavailable");
      update("featured_image", result.imageUrl); setPreviewFailed(false);
      toast({ title: "Image generated" });
    } catch (error) { toast({ title: "Generation failed", description: error instanceof Error ? error.message : "Enter an image URL instead.", variant: "destructive" }); }
    finally { setGenerating(false); }
  };
  return <div className="space-y-5">
    <Button asChild variant="link" className="px-0"><Link to="/admin/posts"><ArrowLeft /> Back to Posts</Link></Button>
    <form onSubmit={save} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" className="text-lg h-12" value={form.title} onChange={e => setForm(previous => ({ ...previous, title: e.target.value, slug: post ? previous.slug : generatePostSlug(e.target.value) }))} required /></div>
        <div className="space-y-2"><Label htmlFor="slug">Slug / Permalink</Label><Input id="slug" value={form.slug} onChange={e => update("slug", e.target.value)} required /><p className="text-sm text-muted-foreground break-all">/post/{form.slug}</p></div>
        <div className="space-y-2"><Label>Content</Label><RichTextEditor content={form.content} onChange={content => update("content", content)} /></div>
        <div className="space-y-2"><Label htmlFor="excerpt">Excerpt</Label><Textarea id="excerpt" rows={5} value={form.excerpt} onChange={e => update("excerpt", e.target.value)} /></div>
      </fieldset>
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        <EditorBox title="Publish">
          <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={value => update("status", value)}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem>{form.status === "scheduled" && <SelectItem value="scheduled">Scheduled</SelectItem>}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Publish Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal"><CalendarIcon />{form.published_at ? format(new Date(form.published_at), "PPP") : "Pick a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="end"><Calendar mode="single" selected={form.published_at ? new Date(form.published_at) : undefined} onSelect={date => update("published_at", date?.toISOString() ?? null)} initialFocus /></PopoverContent></Popover></div>
          <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="animate-spin" />}{post ? "Update" : form.status === "draft" ? "Save Draft" : "Publish"}</Button>
        </EditorBox>
        <EditorBox title="Category"><Select value={form.category || "__none"} onValueChange={value => update("category", value === "__none" ? "" : value)}><SelectTrigger aria-label="Post category"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="__none">Uncategorized</SelectItem>{categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select>{categoriesQuery.error && <p role="alert" className="text-destructive text-sm">Unable to load categories.</p>}</EditorBox>
        <EditorBox title="Audio"><div className="space-y-2"><Label htmlFor="archive_item_id">Archive.org Item ID</Label><Input id="archive_item_id" value={form.archive_item_id} onChange={e => update("archive_item_id", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="playlist_embed_url">Playlist Embed URL</Label><Input id="playlist_embed_url" value={form.playlist_embed_url} onChange={e => update("playlist_embed_url", e.target.value)} /></div></EditorBox>
        <EditorBox title="Featured Image"><div className="space-y-2"><Label htmlFor="featured_image">Image URL</Label><Input id="featured_image" value={form.featured_image} onChange={e => { update("featured_image", e.target.value); setPreviewFailed(false); }} /></div>{form.featured_image && (previewFailed ? <p className="text-sm text-destructive">Image preview unavailable.</p> : <img src={form.featured_image} alt="Featured image preview" className="w-full max-h-56 object-contain border border-border" onError={() => setPreviewFailed(true)} />)}<a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="block text-sm">Open ImgBB to upload an image</a><Button type="button" variant="outline" size="sm" onClick={generateImage} disabled={generating || !form.title.trim()}>{generating ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate Image</Button></EditorBox>
        <EditorBox title="Discussion"><div className="flex items-center gap-2"><Checkbox id="comments_enabled" checked={form.comments_enabled} onCheckedChange={checked => update("comments_enabled", checked === true)} /><Label htmlFor="comments_enabled">Enable comments</Label></div></EditorBox>
      </fieldset>
    </form>
  </div>;
}
