import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminAuthGuard>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </AdminAuthGuard>
    </SidebarProvider>
  );
}
