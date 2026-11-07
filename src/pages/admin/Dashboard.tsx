import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { countAudioPosts, getPopularPosts, type DashboardPost } from "./dashboardData";

export default function AdminDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: async () => {
      const posts: DashboardPost[] = [];
      for (let offset = 0; ; offset += 1000) {
        const result = await supabase.from("posts").select("id, title, slug, category, created_at, published_at, archive_item_id, playlist_embed_url").order("created_at", { ascending: false }).order("id").range(offset, offset + 999);
        if (result.error) throw result.error;
        posts.push(...result.data);
        if (result.data.length < 1000) break;
      }
      const [comments, views, popular, streams] = await Promise.all([
        supabase.from("comments").select("id", { count: "exact", head: true }),
        supabase.from("post_views").select("id", { count: "exact", head: true }),
        supabase.from("post_view_counts").select("post_id, total_views").order("total_views", { ascending: false }).limit(5),
        supabase.from("live_streams").select("platform, is_live, stream_url"),
      ]);
      for (const result of [comments, views, popular, streams]) if (result.error) throw result.error;
      return { posts, comments: comments.count ?? 0, views: views.count ?? 0, audio: countAudioPosts(posts), popular: getPopularPosts(posts, popular.data ?? []), streams: streams.data ?? [] };
    },
  });
  const stats = [
    ["Total Posts", data?.posts.length], ["Total Views", data?.views],
    ["Total Comments", data?.comments], ["Audio Posts", data?.audio],
  ] as const;

  return <AdminLayout title="Dashboard">
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold">At a glance</h2>
        <Button asChild size="sm"><Link to="/admin/posts?new=1"><Plus /> Add New Post</Link></Button>
      </div>
      {error && <div role="alert" className="border border-border bg-card p-4 flex items-center gap-4"><p className="text-destructive text-sm">Unable to load dashboard data.</p><Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => <div key={label} className="admin-stat"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value === undefined ? "—" : value.toLocaleString()}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="border border-border bg-card lg:col-span-2">
          <div className="admin-panel-heading flex items-center justify-between"><h2>Recent Posts</h2><Link to="/admin/posts" className="text-xs font-normal">All posts</Link></div>
          <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead>View</TableHead></TableRow></TableHeader>
            <TableBody>{data?.posts.slice(0, 10).map(post => <TableRow key={post.id}>
              <TableCell className="min-w-40 font-medium"><Link to={`/post/${post.slug}`}>{post.title}</Link></TableCell><TableCell>{post.category || "—"}</TableCell><TableCell className="whitespace-nowrap">{new Date(post.published_at || post.created_at).toLocaleDateString()}</TableCell><TableCell><Link to={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${post.title}`}>View</Link></TableCell>
            </TableRow>)}{!data?.posts.length && <TableRow><TableCell colSpan={4} className="text-muted-foreground">{isLoading ? "Loading…" : error ? "Data unavailable." : "No posts yet."}</TableCell></TableRow>}</TableBody>
          </Table>
        </section>
        <div className="space-y-6">
          <section className="border border-border bg-card">
            <h2 className="admin-panel-heading">Popular Posts</h2>
            <ol className="divide-y divide-border">{data?.popular.map(post => <li key={post.id} className="px-4 py-3"><Link to={`/post/${post.slug}`} className="text-sm font-medium break-words">{post.title}</Link><p className="mt-1 text-xs text-muted-foreground">{post.views.toLocaleString()} views</p></li>)}</ol>
            {!data?.popular.length && <p className="p-4 text-sm text-muted-foreground">{isLoading ? "Loading…" : error ? "Data unavailable." : "No views yet."}</p>}
            <div className="border-t border-border px-4 py-3"><Link to="/admin/analytics" className="text-xs">View analytics</Link></div>
          </section>
          <section className="border border-border bg-card">
            <h2 className="admin-panel-heading">Live Streams</h2>
            <div className="p-4 space-y-4">{["youtube", "facebook"].map(platform => {
              const stream = data?.streams.find(item => item.platform === platform);
              return <div key={platform} className="flex items-center justify-between gap-3 text-sm"><span>{platform === "youtube" ? "YouTube" : "Facebook"}</span><span className={stream?.is_live ? "text-primary font-semibold" : "text-muted-foreground"}>{isLoading ? "Loading…" : !stream ? "Not configured" : stream.is_live ? "● Live" : "○ Offline"}</span></div>;
            })}</div>
            <div className="border-t border-border px-4 py-3"><Link to="/admin/live-streams" className="text-xs">Manage live streams</Link></div>
          </section>
        </div>
      </div>
    </div>
  </AdminLayout>;
}
