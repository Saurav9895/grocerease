
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

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
        <CardContent className="flex-grow p-4">
          <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 bg-muted/50 mt-auto">
          <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
          <Button onClick={handleAddToCart}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add to cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
