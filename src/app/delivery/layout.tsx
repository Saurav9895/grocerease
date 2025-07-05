import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DeliverySidebar } from "@/components/delivery/DeliverySidebar";
import { DeliveryAuthGuard } from "@/components/delivery/DeliveryAuthGuard";
import { Leaf } from "lucide-react";
import Link from "next/link";

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
           <div className="flex flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
              <SidebarTrigger />
              <Link href="/delivery" className="flex items-center gap-2 font-semibold">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="">GrocerEase Delivery</span>
              </Link>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
              {children}
            </main>
          </div>
        </div>
      </DeliveryAuthGuard>
    </SidebarProvider>
  );
}
