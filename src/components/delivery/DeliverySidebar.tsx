

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Leaf, LogOut, Home, History, LayoutDashboard, ClipboardList } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function DeliverySidebar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully.",
    });
    router.push("/signin");
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(".").map((part) => part[0]).join("");
    return parts.slice(0, 2).toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/delivery" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">GrocerEase Delivery</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/delivery"}
              tooltip="Dashboard"
            >
              <Link href="/delivery">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/delivery/assigned") || pathname.startsWith("/delivery/orders")}
              tooltip="Assigned Orders"
            >
              <Link href="/delivery/assigned">
                <ClipboardList />
                <span>Assigned Orders</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/delivery/log")}
              tooltip="Delivery Log"
            >
              <Link href="/delivery/log">
                <History />
                <span>Delivery Log</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Back to Homepage"
            >
              <Link href="/">
                <Home />
                <span>Back to Homepage</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex-col !items-start gap-4">
        <SidebarSeparator />
        {user && (
          <div className="flex items-center gap-3 w-full px-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate">{profile?.name || user.email}</span>
                <span className="text-xs text-muted-foreground">Delivery Person</span>
            </div>
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
          <LogOut />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
