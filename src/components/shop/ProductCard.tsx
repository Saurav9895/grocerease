

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, MoreHorizontal } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isVariant = product.isVariant && product.variants && Object.keys(product.variants).length > 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0 && !isVariant) {
      addToCart({ ...product, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group w-full">
        <div className="relative">
            <Link href={`/product/${product.id}`} className="block w-full">
                <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={`${product.category.replace(/-/g, ' ')} food`}
                    />
                </div>
            </Link>
            <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-grow">
            <Link href={`/product/${product.id}`}>
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-base font-bold leading-tight hover:underline flex-grow">{product.name}</h3>
                    <div className="flex items-baseline gap-2 shrink-0">
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                            Rs{product.originalPrice.toFixed(2)}
                            </span>
                        )}
                        <p className="text-base font-bold text-foreground">
                            {isVariant && 'From '}Rs{product.price.toFixed(2)}
                        </p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-grow mb-4">
                {product.description}
                </p>
            </Link>
        </CardContent>

        <CardFooter className="p-4 pt-0 mt-auto">
            {isVariant ? (
                <Button size="sm" className="w-full" asChild>
                    <Link href={`/product/${product.id}`}>
                      View Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                <Button size="sm" className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
                    {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </CardFooter>
    </Card>
  );
}
