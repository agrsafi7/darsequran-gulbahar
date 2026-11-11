import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { countByStatus, filterPosts, paginate, type AdminPost, type StatusTab } from "./postModel";
import { fetchAllPosts, fetchCommentCounts } from "./postQueries";

const tabs: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" }, { key: "published", label: "Published" }, { key: "draft", label: "Drafts" }, { key: "scheduled", label: "Scheduled" },
];
const statusLabel = (s: string) => s === "draft" ? "Draft" : s === "published" ? "Published" : s === "scheduled" ? "Scheduled" : s;

export default function AdminPosts() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [comments, setComments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const load = async () => {
    try {
      const [p, c] = await Promise.all([fetchAllPosts(), fetchCommentCounts()]);
      setPosts(p); setComments(c);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to fetch posts", variant: "destructive" });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => setPage(1), [tab, search, category]);

  const counts = useMemo(() => countByStatus(posts), [posts]);
  const categoryNames = useMemo(() => Array.from(new Set(posts.map(p => p.category).filter(Boolean) as string[])).sort(), [posts]);
  const filtered = useMemo(() => filterPosts(posts, tab, search, category), [posts, tab, search, category]);
  const { pages, current, items } = paginate(filtered, page);

  if (searchParams.get("new") === "1") return <Navigate to="/admin/posts/new" replace />;

  const handleDelete = async (post: AdminPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) { toast({ title: "Error", description: "Failed to delete post", variant: "destructive" }); return; }
    toast({ title: "Post deleted" });
    setPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const Pager = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{filtered.length} items</span>
      {pages > 1 && <>
        <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)} aria-label="Previous page">‹</Button>
        <span>Page {current} of {pages}</span>
        <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)} aria-label="Next page">›</Button>
      </>}
    </div>
  );

  return (
    <AdminLayout title="Posts">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild size="sm"><Link to="/admin/posts/new">Add New Post</Link></Button>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm" aria-label="Filter posts by status">
          {tabs.map((t, i) => (
            <span key={t.key} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground">|</span>}
              <button type="button" onClick={() => setTab(t.key)} aria-pressed={tab === t.key}
                className={cn("px-1 hover:underline", tab === t.key ? "font-semibold text-foreground" : "text-[hsl(var(--admin-link))]")}>
                {t.label} <span className="text-muted-foreground">({counts[t.key]})</span>
              </button>
            </span>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-52" aria-label="Filter by category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryNames.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts by title" aria-label="Search posts" className="w-64" />
        </div>
        <div className="flex justify-end"><Pager /></div>
        <div className="border border-border bg-card overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Comments</TableHead><TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No posts found.</TableCell></TableRow>
                ) : items.map(post => {
                  const date = post.published_at || post.created_at;
                  return (
                    <TableRow key={post.id} className="group">
                      <TableCell className="min-w-56">
                        <Link to={`/admin/posts/${post.id}/edit`} className="font-semibold hover:underline">{post.title}</Link>
                        <div className="mt-1 flex gap-2 text-xs">
                          <a href={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                          <span className="text-muted-foreground">|</span>
                          <Link to={`/admin/posts/${post.id}/edit`}>Edit</Link>
                          <span className="text-muted-foreground">|</span>
                          <button type="button" className="text-destructive hover:underline" onClick={() => handleDelete(post)}>Delete</button>
                        </div>
                      </TableCell>
                      <TableCell>{post.category || "—"}</TableCell>
                      <TableCell>{statusLabel(post.status)}</TableCell>
                      <TableCell>{comments[post.id] || 0}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="text-muted-foreground">{post.status === "published" ? "Published" : post.status === "scheduled" ? "Scheduled" : "Last Modified"}</div>
                        {format(new Date(post.status === "draft" ? post.updated_at : date), "yyyy/MM/dd")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="flex justify-end"><Pager /></div>
      </div>
    </AdminLayout>
  );
}
