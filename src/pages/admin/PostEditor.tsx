import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { buildPostData, emptyForm, formFromPost, generateSlug, type AdminPost, type PostForm } from "./postModel";
import { fetchCategoryOptions } from "./postQueries";

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-border bg-card"><h2 className="admin-panel-heading">{title}</h2><div className="space-y-3 p-4">{children}</div></section>;
}

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [existing, setExisting] = useState<AdminPost | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm());
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [cats, setCats] = useState<{ categories: { id: string; name: string }[]; darsCategories: { id: string; title: string }[] }>({ categories: [], darsCategories: [] });
  const set = <K extends keyof PostForm>(k: K, v: PostForm[K]) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => { fetchCategoryOptions().then(setCats); }, []);
  useEffect(() => {
    if (!id) { setExisting(null); setForm(emptyForm()); setLoading(false); return; }
    setLoading(true);
    supabase.from("posts").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { toast({ title: "Post not found", variant: "destructive" }); navigate("/admin/posts"); return; }
      setExisting(data as AdminPost); setForm(formFromPost(data as AdminPost)); setLoading(false);
    });
  }, [id]);
  useEffect(() => setImgError(false), [form.featured_image]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) { toast({ title: "Title and slug are required", variant: "destructive" }); return; }
    setSaving(true);
    const postData = buildPostData(form, existing);
    const res = existing
      ? await supabase.from("posts").update(postData).eq("id", existing.id).select().single()
      : await supabase.from("posts").insert(postData).select().single();
    setSaving(false);
    if (res.error) { toast({ title: "Error", description: res.error.message || "Failed to save post", variant: "destructive" }); return; }
    toast({ title: existing ? "Post updated" : "Post created" });
    if (existing) { setExisting(res.data as AdminPost); setForm(formFromPost(res.data as AdminPost)); }
    else navigate(`/admin/posts/${res.data.id}/edit`, { replace: true });
  };

  const categoryKnown = !form.category || cats.categories.some(c => c.name === form.category) || cats.darsCategories.some(c => c.title === form.category);

  return (
    <AdminLayout title={existing ? "Edit Post" : "Add New Post"}>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div className="text-sm"><Link to="/admin/posts">← All Posts</Link></div>
            <Input aria-label="Title" placeholder="Add title" className="h-11 text-lg" value={form.title} required
              onChange={e => { const title = e.target.value; setForm(prev => ({ ...prev, title, slug: existing ? prev.slug : generateSlug(title) })); }} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Label htmlFor="slug" className="text-muted-foreground">Permalink:</Label>
              <span className="text-muted-foreground">/post/</span>
              <Input id="slug" className="h-8 max-w-sm" value={form.slug} required onChange={e => set("slug", e.target.value)} />
              {existing && <a href={`/post/${existing.slug}`} target="_blank" rel="noopener noreferrer">View post</a>}
            </div>
            <RichTextEditor key={existing?.id || "new"} content={form.content} onChange={c => set("content", c)} placeholder="Start writing your post content..." />
            <Box title="Excerpt">
              <Textarea id="excerpt" aria-label="Excerpt" rows={3} value={form.excerpt} onChange={e => set("excerpt", e.target.value)} placeholder="Short description..." />
            </Box>
          </div>
          <aside className="space-y-4">
            <Box title="Publish">
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    {existing?.status === "scheduled" && <SelectItem value="scheduled">Scheduled</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Publish Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />{form.published_at ? format(form.published_at, "PPP") : "Immediately"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.published_at || undefined} onSelect={d => set("published_at", d || null)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                {form.published_at && <button type="button" className="text-xs text-[hsl(var(--admin-link))] hover:underline" onClick={() => set("published_at", null)}>Clear date</button>}
              </div>
              <div className="flex justify-end border-t border-border pt-3">
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{existing ? "Update" : form.status === "published" ? "Publish" : "Save Draft"}</Button>
              </div>
            </Box>
            <Box title="Category">
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger aria-label="Category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {!categoryKnown && <SelectItem value={form.category}>{form.category}</SelectItem>}
                  {cats.categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  {cats.darsCategories.length > 0 && <div className="mt-1 border-t px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Scholars (Dars-e-Quran)</div>}
                  {cats.darsCategories.map(c => <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </Box>
            <Box title="Audio">
              <div className="space-y-1">
                <Label htmlFor="archive_item_id">Archive.org Item ID</Label>
                <Input id="archive_item_id" value={form.archive_item_id} onChange={e => set("archive_item_id", e.target.value)} placeholder="e.g., DoraTafseer2007" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="playlist_embed_url">Playlist Embed URL</Label>
                <Input id="playlist_embed_url" value={form.playlist_embed_url} onChange={e => set("playlist_embed_url", e.target.value)} placeholder="https://archive.org/embed/..." />
              </div>
              <p className="text-xs text-muted-foreground">Audio stays hosted on Archive.org.</p>
            </Box>
            <Box title="Featured Image">
              <Label htmlFor="featured_image" className="sr-only">Image URL</Label>
              <Input id="featured_image" value={form.featured_image} onChange={e => set("featured_image", e.target.value)} placeholder="https://i.ibb.co/..." />
              {form.featured_image && (imgError
                ? <p className="text-xs text-destructive">Image could not be loaded from this URL.</p>
                : <img src={form.featured_image} loading="eager" alt="Featured image preview" className="w-full border border-border object-cover max-h-48" onError={() => setImgError(true)} />)}
              <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-sm">Open ImgBB to upload an image</a>
            </Box>
            <Box title="Discussion">
              <div className="flex items-center gap-2">
                <Checkbox id="comments_enabled" checked={form.comments_enabled} onCheckedChange={c => set("comments_enabled", c === true)} />
                <Label htmlFor="comments_enabled">Enable comments</Label>
              </div>
            </Box>
          </aside>
        </form>
      )}
    </AdminLayout>
  );
}
