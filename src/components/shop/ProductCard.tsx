"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

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
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="relative aspect-square w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={`${product.category.replace(/-/g, ' ')} grocery`}
          />
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
          <CardDescription className="mt-1 text-sm line-clamp-2">{product.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">Rs{product.price.toFixed(2)}</p>
          <Button size="sm" onClick={handleAddToCart}>
             <ShoppingCart className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
