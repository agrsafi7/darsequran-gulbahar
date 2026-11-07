import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminAppearance } from "./AdminAppearance";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("admin-theme") === "dark");
  return (
    <AdminAppearance dark={isDark}>
      <ProtectedRoute requireAdmin>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AdminSidebar />
            <SidebarInset className="min-w-0 flex-1">
              <header className="h-14 flex shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6 bg-card">
                <SidebarTrigger className="shrink-0" />
                {title && <h1>{title}</h1>}
                <div className="ml-auto flex min-w-0 items-center gap-3">
                  <span className="hidden sm:block max-w-64 truncate text-xs text-muted-foreground">{user?.email}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Toggle dark mode" aria-label="Toggle dark mode" onClick={() => {
                    setIsDark(!isDark);
                    localStorage.setItem("admin-theme", !isDark ? "dark" : "light");
                  }}>{isDark ? <Sun /> : <Moon />}</Button>
                </div>
              </header>
              <div className="admin-page-content flex-1 p-6">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    </AdminAppearance>
  );
}
