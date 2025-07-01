
"use client";

import Link from "next/link";
import { ShoppingCart, Leaf, User, LogOut, Menu, LayoutDashboard, Search, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/shop/CartSheet";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

export function ShopHeader() {
  const { cartCount } = useCart();
  const { user, profile, signOut, loading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#categories", label: "Categories" },
    { href: "/products", label: "Products" },
    { href: "/orders", label: "My Orders", auth: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully.",
    });
    router.push("/");
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(".").map((part) => part[0]).join("");
    return parts.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-20 items-center justify-between gap-6">
          
          {/* Left Part: Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="font-bold text-2xl text-primary">InstaGrocer</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-end gap-6">
            {/* Center Part: Search Bar */}
            <div className="w-full max-w-md">
              <div className="relative">
                  <Input 
                      type="search"
                      placeholder="Search products..."
                      className="text-base h-11 rounded-lg border-2 border-primary/20 focus-visible:ring-primary focus-visible:border-primary pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Right Part: User Actions + Cart */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Current location</p>
                      <p className="font-semibold flex items-center">Dwarka, New Delhi <ChevronDown className="h-4 w-4" /></p>
                  </div>
              </div>
              
              {loading ? (
                <Skeleton className="h-10 w-28 rounded-lg" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            user.photoURL ||
                            `https://i.pravatar.cc/40?u=${user.uid}`
                          }
                          alt={user.email || "User"}
                          data-ai-hint="user avatar"
                        />
                        <AvatarFallback>
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          My Account
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      {profile?.adminRole && (
                        <DropdownMenuItem onClick={() => router.push('/admin')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                       <DropdownMenuItem onClick={() => router.push('/orders')}>
                           <ShoppingCart className="mr-2 h-4 w-4" />
                           <span>My Orders</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" variant="outline" className="h-10 px-4 rounded-lg bg-primary/10 border-primary text-primary hover:bg-primary/20 hover:text-primary">
                    <Link href="/signin">Login/Signup</Link>
                </Button>
              )}
              
              <Button
                variant="outline"
                className="relative h-11 w-11 rounded-lg"
                size="icon"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                 <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <Link href="/" className="flex items-center space-x-2 mb-6">
                  <Leaf className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">InstaGrocer</span>
                </Link>
                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    (!link.auth || user) && (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "text-muted-foreground transition-colors hover:text-foreground py-2 text-base",
                            pathname === link.href && "text-foreground font-semibold"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    )
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
