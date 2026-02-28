import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Newspaper,
  MessageSquare,
  Image,
  Eye,
  ExternalLink,
  Loader2,
  Users,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface Stats {
  pages: number;
  posts: number;
  comments: number;
  media: number;
  totalViews: number;
}

interface RecentComment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface DailyData {
  day: string;
  posts: number;
}

interface NavigationItem {
  id: string;
  title: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ pages: 0, posts: 0, comments: 0, media: 0, totalViews: 0 });
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagesRes, postsRes, commentsRes, mediaRes, navRes, viewsRes, recentCommentsRes, allPostsRes] = await Promise.all([
          supabase.from("pages").select("id", { count: "exact", head: true }),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("comments").select("id", { count: "exact", head: true }),
          supabase.from("media_library").select("id", { count: "exact", head: true }),
          supabase.from("navigation_items").select("*").order("sort_order", { ascending: true }),
          supabase.from("post_views").select("id", { count: "exact", head: true }),
          supabase.from("comments").select("id, author_name, content, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("posts").select("id, created_at, published_at").order("created_at", { ascending: false }),
        ]);

        setStats({
          pages: pagesRes.count ?? 0,
          posts: postsRes.count ?? 0,
          comments: commentsRes.count ?? 0,
          media: mediaRes.count ?? 0,
          totalViews: viewsRes.count ?? 0,
        });

        setNavItems(navRes.data || []);
        setRecentComments(recentCommentsRes.data || []);

        // Build weekly chart data (last 7 days)
        const sevenDaysAgo = subDays(new Date(), 6);
        const days = eachDayOfInterval({ start: sevenDaysAgo, end: new Date() });
        const dailyMap = new Map<string, number>();
        days.forEach(day => dailyMap.set(format(day, "yyyy-MM-dd"), 0));

        (allPostsRes.data || []).forEach(post => {
          const date = post.published_at || post.created_at;
          if (date) {
            const dayKey = format(new Date(date), "yyyy-MM-dd");
            if (dailyMap.has(dayKey)) {
              dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
            }
          }
        });

        const dailyArray = Array.from(dailyMap.entries()).map(([date, posts]) => ({
          day: format(new Date(date), "EEE"),
          posts,
        }));
        setDailyData(dailyArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Posts",
      value: stats.posts,
      icon: Newspaper,
      bg: "bg-[hsl(142_60%_45%)]",
      iconBg: "bg-[hsl(142_60%_38%)]",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      bg: "bg-[hsl(205_75%_55%)]",
      iconBg: "bg-[hsl(205_75%_48%)]",
    },
    {
      title: "Comments",
      value: stats.comments,
      icon: MessageSquare,
      bg: "bg-[hsl(0_70%_58%)]",
      iconBg: "bg-[hsl(0_70%_50%)]",
    },
    {
      title: "Media Files",
      value: stats.media,
      icon: Image,
      bg: "bg-[hsl(42_75%_55%)]",
      iconBg: "bg-[hsl(42_75%_48%)]",
    },
  ];

  // Get parent items and their children
  const parentItems = navItems.filter((item) => !item.parent_id);
  const getChildren = (parentId: string) => navItems.filter((item) => item.parent_id === parentId);

  const getEditLink = (url: string) => {
    if (url === "/" || url === "/about" || url === "/contact") return "/admin/pages";
    if (url.startsWith("/dars-e-quran") || url === "/speeches" || url === "/books") return "/admin/posts";
    return "/admin/pages";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stat Cards - Colorful like reference */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className={`${stat.bg} rounded-xl p-5 text-white shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold font-sans">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </p>
                </div>
                <div className={`${stat.iconBg} rounded-full p-3`}>
                  <stat.icon className="h-6 w-6 text-white/90" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Notifications Row */}
        <div className="grid gap-6 md:grid-cols-5">
          {/* Bar Chart - spans 3 columns */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" />
                Posts This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[250px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="posts"
                        fill="hsl(205, 75%, 55%)"
                        radius={[4, 4, 0, 0]}
                        name="Posts"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Comments / Notifications - spans 2 columns */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                Recent Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentComments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentComments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{comment.author_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{comment.content}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                  ))}
                  <Button asChild variant="link" className="px-0 text-primary">
                    <Link to="/admin/comments">Show all →</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Edit + Quick Actions Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ExternalLink className="h-5 w-5" />
                Quick Edit: Menu Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : navItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No navigation items found.{" "}
                  <Link to="/admin/navigation" className="text-primary underline">
                    Add navigation items
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {parentItems.map((item) => {
                    const children = getChildren(item.id);
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.title}</span>
                          <Button asChild size="sm" variant="outline">
                            <Link to={getEditLink(item.url)}>Edit Content</Link>
                          </Button>
                        </div>
                        {children.length > 0 && (
                          <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                            {children.map((child) => (
                              <div key={child.id} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{child.title}</span>
                                <Button asChild size="sm" variant="ghost">
                                  <Link to={getEditLink(child.url)}>Edit</Link>
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t">
                    <Button asChild variant="link" className="px-0">
                      <Link to="/admin/navigation">Manage Navigation Menu →</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
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
        </div>
      </div>
    </AdminLayout>
  );
}
