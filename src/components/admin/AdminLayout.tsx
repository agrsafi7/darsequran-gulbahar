import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user } = useAuth();

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
