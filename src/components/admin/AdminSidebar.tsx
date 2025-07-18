
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
import { Leaf, LayoutDashboard, Package, ShoppingCart, LayoutList, LogOut, Home, Settings, ClipboardList, History, DollarSign, Store } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function AdminSidebar() {
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
  
  const isMainOrStandardAdmin = profile?.adminRole === 'main' || profile?.adminRole === 'standard';
  const canManageStoreEntities = profile?.adminRole === 'main' || profile?.adminRole === 'standard' || profile?.adminRole === 'vendor';

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">GrocerEase Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Common Links */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin"} tooltip="Dashboard">
              <Link href="/admin"><LayoutDashboard /><span>Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/products")} tooltip="Products">
              <Link href="/admin/products"><Package /><span>Products</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/orders")} tooltip="Orders">
              <Link href="/admin/orders"><ShoppingCart /><span>Orders</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Categories & Attributes for Admins and Vendors */}
          {canManageStoreEntities && (
             <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/categories")} tooltip="Categories">
                  <Link href="/admin/categories"><LayoutList /><span>Categories</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/attributes")} tooltip="Attributes">
                  <Link href="/admin/attributes"><ClipboardList /><span>Attributes</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          {/* Admin-only Links */}
          {isMainOrStandardAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/vendors")} tooltip="Vendors">
                  <Link href="/admin/vendors"><Store /><span>Vendors</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/deliveries")} tooltip="Delivery Log">
                  <Link href="/admin/deliveries"><History /><span>Delivery Log</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/submissions")} tooltip="Submissions">
                  <Link href="/admin/submissions"><DollarSign /><span>Submissions</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

           {/* Main Admin-only Links */}
           {profile?.adminRole === 'main' && (
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/settings")} tooltip="Settings">
                <Link href="/admin/settings"><Settings /><span>Settings</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
           )}
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
                <span className="text-xs text-muted-foreground capitalize">{profile?.adminRole} Administrator</span>
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
