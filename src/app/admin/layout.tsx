import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminAuthGuard>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
           <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
              <SidebarTrigger />
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="">GrocerEase Admin</span>
              </Link>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
              {children}
            </main>
          </div>
        </div>
      </AdminAuthGuard>
    </SidebarProvider>
  );
}
