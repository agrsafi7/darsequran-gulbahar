import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Newspaper, MessageSquare, Image, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  pages: number;
  posts: number;
  comments: number;
  media: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ pages: 0, posts: 0, comments: 0, media: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pagesRes, postsRes, commentsRes, mediaRes] = await Promise.all([
          supabase.from("pages").select("id", { count: "exact", head: true }),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("comments").select("id", { count: "exact", head: true }),
          supabase.from("media_library").select("id", { count: "exact", head: true }),
        ]);

        setStats({
          pages: pagesRes.count ?? 0,
          posts: postsRes.count ?? 0,
          comments: commentsRes.count ?? 0,
          media: mediaRes.count ?? 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Pages", value: stats.pages, icon: FileText, color: "text-blue-500" },
    { title: "Total Posts", value: stats.posts, icon: Newspaper, color: "text-green-500" },
    { title: "Comments", value: stats.comments, icon: MessageSquare, color: "text-yellow-500" },
    { title: "Media Files", value: stats.media, icon: Image, color: "text-purple-500" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Welcome to your admin dashboard. Use the sidebar to manage your content.
              </p>
              <ul className="text-sm space-y-1 mt-4">
                <li>• <strong>Pages:</strong> Create and manage static pages</li>
                <li>• <strong>Posts:</strong> Write and publish blog posts</li>
                <li>• <strong>Navigation:</strong> Customize your site menu</li>
                <li>• <strong>Media:</strong> Upload and manage images</li>
                <li>• <strong>Comments:</strong> Moderate user comments</li>
                <li>• <strong>Settings:</strong> Configure site options</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No recent activity to display.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
