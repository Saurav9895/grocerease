
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleIncrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
  };
  
  const handleDecrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart - 1);
  };
  
  const mockOldPrice = product.price * 1.15;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <Link href={`/product/${product.id}`} className="block outline-none">
        <CardContent className="p-4 space-y-3 flex flex-col h-full">
            <div className="relative">
                <div className="aspect-square relative rounded-md overflow-hidden">
                    <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    data-ai-hint={`${product.category.replace(/-/g, ' ')} grocery`}
                    />
                </div>
                 <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background">
                    <Heart className="h-4 w-4" />
                </Button>
            </div>
          
            <div className="flex-grow">
              <h3 className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground">1 kg</p>
            </div>

            <div className="flex items-end justify-between mt-auto pt-2">
                <div>
                    <p className="text-sm font-bold text-foreground">Rs{product.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground line-through">Rs{mockOldPrice.toFixed(2)}</p>
                </div>

                {quantityInCart === 0 ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-20 border-primary text-primary hover:bg-primary/10 hover:text-primary font-bold"
                        onClick={handleAddToCart}
                    >
                        ADD
                    </Button>
                ) : (
                    <div className="flex items-center justify-center h-9 w-24 rounded-md border border-primary bg-primary/10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 text-primary hover:bg-primary/20 hover:text-primary"
                            onClick={handleDecrease}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-primary text-sm tabular-nums">{quantityInCart}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 text-primary hover:bg-primary/20 hover:text-primary"
                            onClick={handleIncrease}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </CardContent>
      </Link>
    </Card>
  );
}
