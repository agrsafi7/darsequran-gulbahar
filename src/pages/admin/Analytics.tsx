import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Newspaper, MessageSquare, TrendingUp, Calendar, Users, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface ContentStats {
  totalPosts: number;
  totalPages: number;
  totalComments: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
}

interface PostWithCategory {
  id: string;
  title: string;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

interface CategoryData {
  name: string;
  count: number;
}

interface DailyData {
  date: string;
  posts: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Analytics() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<PostWithCategory[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch counts in parallel
      const [postsRes, pagesRes, commentsRes, allPostsRes] = await Promise.all([
        supabase.from("posts").select("id, status", { count: "exact" }),
        supabase.from("pages").select("id", { count: "exact", head: true }),
        supabase.from("comments").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id, title, category, status, published_at, created_at").order("created_at", { ascending: false }),
      ]);

      const posts = postsRes.data || [];
      const publishedPosts = posts.filter(p => p.status === "published").length;
      const draftPosts = posts.filter(p => p.status === "draft").length;
      const scheduledPosts = posts.filter(p => p.status === "scheduled").length;

      setStats({
        totalPosts: postsRes.count ?? 0,
        totalPages: pagesRes.count ?? 0,
        totalComments: commentsRes.count ?? 0,
        publishedPosts,
        draftPosts,
        scheduledPosts,
      });

      // Recent posts
      setRecentPosts((allPostsRes.data || []).slice(0, 10));

      // Category distribution
      const categoryMap = new Map<string, number>();
      (allPostsRes.data || []).forEach(post => {
        const cat = post.category || "Uncategorized";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
      const categoryArray = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setCategoryData(categoryArray);

      // Daily posts for last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
      const dailyMap = new Map<string, number>();
      days.forEach(day => {
        dailyMap.set(format(day, "yyyy-MM-dd"), 0);
      });
      
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
        date: format(new Date(date), "MMM d"),
        posts,
      }));
      setDailyData(dailyArray);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Posts", value: stats?.totalPosts ?? 0, icon: Newspaper, color: "text-primary" },
    { title: "Published", value: stats?.publishedPosts ?? 0, icon: Eye, color: "text-green-500" },
    { title: "Drafts", value: stats?.draftPosts ?? 0, icon: FileText, color: "text-yellow-500" },
    { title: "Comments", value: stats?.totalComments ?? 0, icon: MessageSquare, color: "text-blue-500" },
  ];

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Stat Cards */}
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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Posts Over Time */}
              <Card className="col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Content Activity (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
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
                            borderRadius: "8px"
                          }}
                        />
                        <Bar 
                          dataKey="posts" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                          name="Posts"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Content by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {categoryData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No category data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            {/* Recent Posts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Title</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPosts.map((post) => (
                        <tr key={post.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium truncate max-w-[200px]">{post.title}</td>
                          <td className="py-3 px-2 text-muted-foreground">{post.category || "—"}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              post.status === "published" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                : post.status === "scheduled"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                          </td>
                        </tr>
                      ))}
                      {recentPosts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            No posts found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Content Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPages ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Static pages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.scheduledPosts ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting publish</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalComments ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total comments</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* GA4 Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Google Analytics Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Your site is integrated with Google Analytics 4 (G-C7MNDRCNE8). 
                  For detailed traffic metrics, user behavior, and real-time data, visit your{" "}
                  <a 
                    href="https://analytics.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Analytics Dashboard
                  </a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
