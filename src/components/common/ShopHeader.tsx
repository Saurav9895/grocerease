"use client";

import Link from "next/link";
import { ShoppingCart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/shop/CartSheet";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";

export function ShopHeader() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">GrocerEase</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Button
                variant="ghost"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
