
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Star, StarHalf } from 'lucide-react';

// Helper function to render star ratings
const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground/50 fill-muted-foreground/20" />
        ))}
      </div>
    );
};


interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart({ ...product, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <Link href={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${product.category.replace(/-/g, ' ')} grocery`}
          />
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <h3 className="text-base font-semibold leading-tight flex-grow line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            {renderStars(product.rating)}
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">Rs{product.price.toFixed(2)}</p>
          <Button size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
             <ShoppingCart className="mr-2 h-4 w-4" />
             {product.stock > 0 ? 'Add' : 'Out'}
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
