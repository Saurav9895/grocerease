"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Leaf, LayoutDashboard, Package, ShoppingCart, Home } from "lucide-react";
import { Button } from "../ui/button";

export function AdminSidebar() {
  const pathname = usePathname();

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
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin"}
              tooltip="Dashboard"
            >
              <Link href="/admin">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/products"}
              tooltip="Products"
            >
              <Link href="/admin/products">
                <Package />
                <span>Products</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/orders"}
              tooltip="Orders"
            >
              <Link href="/admin/orders">
                <ShoppingCart />
                <span>Orders</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/">
            <Home />
            <span>Back to Shop</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
