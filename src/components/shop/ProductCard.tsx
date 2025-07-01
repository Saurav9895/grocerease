"use client";

import Image from 'next/image';
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

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
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
        <div className="p-4">
          <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-4">
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-muted/50">
        <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
