
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Star, StarHalf } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

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


export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Link href={`/product/${product.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg h-full">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-video relative">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={`${product.category.replace(/-/g, ' ')} grocery`}
            />
          </div>
          <div className="p-4 pb-0">
            <CardTitle className="text-lg leading-tight line-clamp-2">{product.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-2">
           <div className="flex items-center gap-2">
            {renderStars(product.rating)}
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 bg-muted/50 mt-auto">
          <p className="text-lg font-semibold text-primary">Rs{product.price.toFixed(2)}</p>
          <Button onClick={handleAddToCart}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add to cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
