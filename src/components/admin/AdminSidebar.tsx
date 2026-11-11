import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Newspaper, Menu, MessageSquare, Settings, LogOut, Layers, Tags, Megaphone, Radio, BarChart3, Plus, Users, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const groups = [
  { label: "MAIN", items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }, { title: "Analytics", url: "/admin/analytics", icon: BarChart3 }] },
  { label: "CONTENT", items: [{ title: "Posts", url: "/admin/posts", icon: Newspaper }, { title: "Add New Post", url: "/admin/posts/new", icon: Plus }, { title: "Pages", url: "/admin/pages", icon: FileText }, { title: "Categories", url: "/admin/categories", icon: Tags }, { title: "Hero Slides", url: "/admin/hero-slides", icon: Layers }] },
  { label: "ENGAGE", items: [{ title: "Comments", url: "/admin/comments", icon: MessageSquare }, { title: "Live Streams", url: "/admin/live-streams", icon: Radio }] },
  { label: "SITE", items: [{ title: "Navigation", url: "/admin/navigation", icon: Menu }, { title: "Ad Placements", url: "/admin/ads", icon: Megaphone }] },
  { label: "ADMIN", items: [{ title: "Users", url: "/admin/users", icon: Users }, { title: "Settings", url: "/admin/settings", icon: Settings }] },
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed" && !isMobile;
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <NavLink to="/admin" className="admin-sidebar-link text-sm font-semibold" aria-label="Admin Panel">{collapsed ? "DQ" : "DarseQuran · Admin"}</NavLink>
        {isMobile && <SidebarTrigger className="text-sidebar-foreground" />}
      </SidebarHeader>
      <SidebarContent className="py-3">
        {groups.map(group => <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>
            {group.items.map(item => {
              const active = item.url === "/admin/posts" ? location.pathname === "/admin/posts" || /^\/admin\/posts\/[^/]+\/edit$/.test(location.pathname) : location.pathname === item.url;
              return <SidebarMenuItem key={item.title}><SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                <NavLink to={item.url} onClick={closeMobile} end={item.url === "/admin"} aria-current={active ? "page" : undefined}>
                  {collapsed && <item.icon className="h-4 w-4 shrink-0" />}
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton></SidebarMenuItem>;
            })}
          </SidebarMenu></SidebarGroupContent>
        </SidebarGroup>)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button asChild variant="ghost" size="sm" className="admin-sidebar-link justify-start"><NavLink to="/" target="_blank" rel="noopener noreferrer" aria-label="View Website">{collapsed ? <ExternalLink /> : "View Website"}</NavLink></Button>
        <Button variant="ghost" size="sm" className="admin-sidebar-link justify-start" onClick={signOut} aria-label="Sign Out">{collapsed ? <LogOut /> : "Sign Out"}</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
