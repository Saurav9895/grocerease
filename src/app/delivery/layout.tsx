
import { SidebarProvider } from "@/components/ui/sidebar";
import { DeliverySidebar } from "@/components/delivery/DeliverySidebar";
import { DeliveryAuthGuard } from "@/components/delivery/DeliveryAuthGuard";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DeliveryAuthGuard>
        <div className="flex min-h-screen bg-background">
          <DeliverySidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </div>
      </DeliveryAuthGuard>
    </SidebarProvider>
  );
}
