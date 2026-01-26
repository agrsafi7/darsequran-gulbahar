import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Newspaper, MessageSquare, Image, Eye, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  pages: number;
  posts: number;
  comments: number;
  media: number;
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
  const [stats, setStats] = useState<Stats>({ pages: 0, posts: 0, comments: 0, media: 0 });
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagesRes, postsRes, commentsRes, mediaRes, navRes] = await Promise.all([
          supabase.from("pages").select("id", { count: "exact", head: true }),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("comments").select("id", { count: "exact", head: true }),
          supabase.from("media_library").select("id", { count: "exact", head: true }),
          supabase.from("navigation_items").select("*").order("sort_order", { ascending: true }),
        ]);

        setStats({
          pages: pagesRes.count ?? 0,
          posts: postsRes.count ?? 0,
          comments: commentsRes.count ?? 0,
          media: mediaRes.count ?? 0,
        });

        setNavItems(navRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: "Total Pages", value: stats.pages, icon: FileText, color: "text-blue-500" },
    { title: "Total Posts", value: stats.posts, icon: Newspaper, color: "text-green-500" },
    { title: "Comments", value: stats.comments, icon: MessageSquare, color: "text-yellow-500" },
    { title: "Media Files", value: stats.media, icon: Image, color: "text-purple-500" },
  ];

  // Get parent items and their children
  const parentItems = navItems.filter((item) => !item.parent_id);
  const getChildren = (parentId: string) => navItems.filter((item) => item.parent_id === parentId);

  // Determine where to link based on URL pattern
  const getEditLink = (url: string) => {
    if (url === "/" || url === "/about" || url === "/contact") {
      // These are static pages - link to Pages admin
      return "/admin/pages";
    }
    if (url.startsWith("/dars-e-quran") || url === "/speeches" || url === "/books") {
      // These are category-based pages showing posts
      return "/admin/posts";
    }
    return "/admin/pages";
  };

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
                  No navigation items found. <Link to="/admin/navigation" className="text-primary underline">Add navigation items</Link>
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
                            <Link to={getEditLink(item.url)}>
                              Edit Content
                            </Link>
                          </Button>
                        </div>
                        {children.length > 0 && (
                          <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                            {children.map((child) => (
                              <div key={child.id} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{child.title}</span>
                                <Button asChild size="sm" variant="ghost">
                                  <Link to={getEditLink(child.url)}>
                                    Edit
                                  </Link>
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
                      <Link to="/admin/navigation">
                        Manage Navigation Menu →
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
        </div>
      </div>
    </AdminLayout>
  );
}
