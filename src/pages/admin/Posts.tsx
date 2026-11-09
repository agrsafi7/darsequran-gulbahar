import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { countByStatus, filterPosts, paginate, type PostStatusTab } from "./posts/postList";

const TABS: { key: PostStatusTab; label: string }[] = [
  { key: "all", label: "All" }, { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" }, { key: "scheduled", label: "Scheduled" },
];
const STATUS_LABEL: Record<string, string> = { published: "Published", draft: "Draft", scheduled: "Scheduled" };

export default function AdminPosts() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tab = (TABS.some(t => t.key === params.get("status")) ? params.get("status") : "all") as PostStatusTab;
  const category = params.get("category") || "all";
  const page = Number(params.get("page")) || 1;
  const [search, setSearch] = useState(params.get("s") || "");

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === null || v === "" ? next.delete(k) : next.set(k, v)));
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  };
  useEffect(() => {
    const t = setTimeout(() => { if ((params.get("s") || "") !== search) update({ s: search }); }, 250);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-posts-list"],
    queryFn: async () => {
      const [posts, comments, cats, dars] = await Promise.all([
        supabase.from("posts").select("id, title, slug, category, status, comments_enabled, published_at, created_at, updated_at").order("created_at", { ascending: false }),
        supabase.from("comments").select("post_id"),
        supabase.from("categories").select("id, name").order("sort_order"),
        supabase.from("dars_categories").select("id, title").order("sort_order"),
      ]);
      if (posts.error) throw posts.error;
      const commentCounts = new Map<string, number>();
      (comments.data || []).forEach(c => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));
      const names = new Set<string>();
      (cats.data || []).forEach(c => names.add(c.name));
      (dars.data || []).forEach(c => names.add(c.title));
      (posts.data || []).forEach(p => p.category && names.add(p.category));
      return { posts: posts.data || [], commentCounts, categories: [...names] };
    },
  });

  const posts = data?.posts || [];
  const counts = countByStatus(posts);
  const filtered = useMemo(() => filterPosts(posts, tab, params.get("s") || "", category), [posts, tab, params, category]);
  const view = paginate(filtered, page);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    toast({ title: "Post deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-posts-list"] });
  };

  if (params.get("new") === "1") return <Navigate to="/admin/posts/new" replace />;

  return (
    <AdminLayout title="Posts">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild size="sm"><Link to="/admin/posts/new"><Plus /> Add New Post</Link></Button>
        </div>
        <nav aria-label="Filter by status" className="flex flex-wrap items-center gap-x-1 text-sm">
          {TABS.map((t, i) => (
            <span key={t.key} className="flex items-center">
              {i > 0 && <span className="px-1 text-muted-foreground">|</span>}
              <button type="button" onClick={() => update({ status: t.key === "all" ? null : t.key })}
                aria-current={tab === t.key ? "page" : undefined}
                className={tab === t.key ? "font-semibold text-foreground" : "admin-text-link"}>
                {t.label} <span className="text-muted-foreground font-normal">({counts[t.key]})</span>
              </button>
            </span>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={category} onValueChange={v => update({ category: v === "all" ? null : v })}>
            <SelectTrigger className="w-full sm:w-56" aria-label="Filter by category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="none">Uncategorized</SelectItem>
              {data?.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="search" placeholder="Search post titles" aria-label="Search post titles" value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 sm:ml-auto" />
        </div>
        <section className="border border-border bg-card">
          {isLoading ? <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div> :
            error ? <div role="alert" className="p-6 flex items-center gap-4"><p className="text-destructive text-sm">Unable to load posts.</p><Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button></div> :
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Comments</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {view.items.map(post => (
                  <TableRow key={post.id} className="group">
                    <TableCell className="min-w-48">
                      <Link to={`/admin/posts/${post.id}/edit`} className="font-semibold">{post.title}</Link>
                      <div className="mt-1 flex gap-2 text-xs">
                        <Link to={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${post.title}`}>View</Link>
                        <span className="text-muted-foreground">|</span>
                        <Link to={`/admin/posts/${post.id}/edit`} aria-label={`Edit ${post.title}`}>Edit</Link>
                        <span className="text-muted-foreground">|</span>
                        <button type="button" className="text-destructive hover:underline" onClick={() => handleDelete(post.id, post.title)} aria-label={`Delete ${post.title}`}>Delete</button>
                      </div>
                    </TableCell>
                    <TableCell>{post.category || "—"}</TableCell>
                    <TableCell>{STATUS_LABEL[post.status] || post.status}</TableCell>
                    <TableCell>{post.comments_enabled ? (data?.commentCounts.get(post.id) || 0) : "Off"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="text-muted-foreground text-xs">{STATUS_LABEL[post.status] || post.status}</div>
                      {new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {!view.items.length && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No posts found.</TableCell></TableRow>}
              </TableBody>
            </Table>}
        </section>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <span className="text-muted-foreground">{filtered.length} items</span>
          <Button variant="outline" size="sm" disabled={view.page <= 1} onClick={() => update({ page: String(view.page - 1) })}>‹ Previous</Button>
          <span>Page {view.page} of {view.totalPages}</span>
          <Button variant="outline" size="sm" disabled={view.page >= view.totalPages} onClick={() => update({ page: String(view.page + 1) })}>Next ›</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
