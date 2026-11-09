import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchAdminPosts, fetchPostCategories } from "./postQueries";
import { filterPosts, paginatePosts, postCounts, POSTS_PER_PAGE } from "./postModel";

export default function AdminPosts() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAdminPosts });
  const categoriesQuery = useQuery({ queryKey: ["admin-post-categories"], queryFn: fetchPostCategories });
  const posts = query.data ?? [];
  const counts = postCounts(posts);
  const filtered = filterPosts(posts, status, search, category);
  const paginated = paginatePosts(filtered, page);
  const categories = Array.from(new Set([
    ...(categoriesQuery.data?.categories.map(c => c.name) ?? []),
    ...(categoriesQuery.data?.scholars.map(c => c.title) ?? []),
    ...posts.flatMap(p => p.category ? [p.category] : []),
  ])).sort((a, b) => a.localeCompare(b));
  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    setDeleting(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
      toast({ title: "Post deleted" });
    }
  };
  if (params.get("new") === "1") return <Navigate to="/admin/posts/new" replace />;
  return <AdminLayout title="Posts">
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div role="tablist" aria-label="Post status" className="flex flex-wrap items-center gap-1">
          {([['all', 'All'], ['published', 'Published'], ['draft', 'Drafts'], ['scheduled', 'Scheduled']] as const).map(([value, label]) =>
            <Button key={value} role="tab" aria-selected={status === value} variant="link" className={status === value ? "font-semibold underline" : "font-normal"} onClick={() => { setStatus(value); setPage(1); }}>{label} ({query.isLoading ? "…" : counts[value]})</Button>)}
        </div>
        <Button asChild size="sm"><Link to="/admin/posts/new"><Plus /> Add New Post</Link></Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input type="search" aria-label="Search post titles" placeholder="Search post titles…" className="w-full sm:w-72" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <Select value={category} onValueChange={value => { setCategory(value); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Filter by category"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="uncategorized">Uncategorized</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {query.error ? <div role="alert" className="flex items-center gap-4 border border-border bg-card p-4"><p className="text-destructive">Unable to load posts.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> :
        <section className="border border-border bg-card">
          <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Comments</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>{paginated.rows.map(post => <TableRow key={post.id}>
              <TableCell className="min-w-56"><Link className="font-semibold" to={`/admin/posts/${post.id}/edit`}>{post.title}</Link>
                <div className="flex items-center gap-2 mt-1 text-xs"><Link to={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer">View</Link><span className="text-border">|</span><Link to={`/admin/posts/${post.id}/edit`}>Edit</Link><span className="text-border">|</span><Button variant="link" className="h-auto p-0 text-xs text-destructive" disabled={deleting === post.id} onClick={() => remove(post.id)}>Delete</Button></div>
              </TableCell>
              <TableCell>{post.category || "—"}</TableCell><TableCell className="capitalize">{post.status}</TableCell><TableCell>{post.comments_enabled ? "On" : "Off"}</TableCell><TableCell className="whitespace-nowrap">{new Date(post.published_at || post.created_at).toLocaleDateString()}</TableCell>
            </TableRow>)}{!paginated.rows.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{query.isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "No posts found."}</TableCell></TableRow>}</TableBody>
          </Table>
        </section>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{filtered.length ? `${(paginated.current - 1) * POSTS_PER_PAGE + 1}–${Math.min(paginated.current * POSTS_PER_PAGE, filtered.length)} of ${filtered.length} posts` : "0 posts"}</p>
        <nav aria-label="Posts pagination" className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Previous page" disabled={paginated.current === 1} onClick={() => setPage(paginated.current - 1)}><ChevronLeft /></Button><span>Page {paginated.current} of {paginated.pages}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={paginated.current === paginated.pages} onClick={() => setPage(paginated.current + 1)}><ChevronRight /></Button></nav>
      </div>
    </div>
  </AdminLayout>;
}
