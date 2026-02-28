import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") {
      setIsDark(true);
    }
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className="h-14 flex items-center gap-4 border-b border-border px-6 bg-card">
              <SidebarTrigger className="-ml-2" />
              {title && (
                <h1 className="font-heading text-xl font-semibold">{title}</h1>
              )}
              <div className="ml-auto flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="h-9 w-9 rounded-full"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
