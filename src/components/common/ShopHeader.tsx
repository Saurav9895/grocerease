

"use client";

import Link from "next/link";
import { ShoppingCart, Leaf, User, LogOut, LayoutDashboard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/shop/CartSheet";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/AuthProvider";
import React, { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { getProducts } from "@/lib/data";
import Image from "next/image";


export function ShopHeader() {
  const { cartCount } = useCart();
  const { user, profile, signOut, loading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      const productsData = await getProducts();
      setAllProducts(productsData);
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsResultsVisible(false);
      return;
    }

    const filtered = allProducts
      .filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5); 

    setSearchResults(filtered);
    setIsResultsVisible(filtered.length > 0);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsResultsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${searchQuery.trim()}`);
      setIsResultsVisible(false);
    }
  };
  
  const handleResultClick = () => {
    setSearchQuery('');
    setIsResultsVisible(false);
  };

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
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-bold">GrocerEase</span>
            </Link>
          </div>
          
          <div ref={searchContainerRef} className="flex-1 hidden md:flex justify-center px-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
                <div className="relative w-full">
                    <Input 
                        placeholder="Search products..." 
                        className="pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-0 top-0 h-full px-3 text-muted-foreground">
                      <Search className="h-5 w-5" />
                    </button>
                </div>
                {isResultsVisible && (
                <div className="absolute top-full mt-2 w-full bg-card border rounded-md shadow-lg z-50">
                    <ul className="py-1">
                    {searchResults.map(product => (
                        <li key={product.id}>
                        <Link 
                            href={`/product/${product.id}`} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-accent"
                            onClick={handleResultClick}
                        >
                            <Image src={product.imageUrl} alt={product.name} width={32} height={32} className="rounded-sm object-cover" data-ai-hint={`${product.category.replace(/-/g, ' ')}`} />
                            <span className="text-sm font-medium">{product.name}</span>
                        </Link>
                        </li>
                    ))}
                    </ul>
                </div>
                )}
            </form>
          </div>
          
          <div className="flex items-center gap-4">
             {loading ? <Skeleton className="h-10 w-10 rounded-full" /> : (
                user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
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
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                 <Button asChild size="sm">
                    <Link href="/signin">Sign In</Link>
                </Button>
              )
             )}

            <Button
              variant="outline"
              className="relative"
              size="icon"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </div>
        </div>
      </header>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
