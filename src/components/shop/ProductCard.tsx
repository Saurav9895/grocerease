
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isVariant = product.isVariant && product.variants && Object.keys(product.variants).length > 0;

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <Card className="relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Favorite button */}
        <div 
          role="button"
          aria-label="Add to favorites"
          className="absolute top-0 right-0 h-10 w-10 z-10 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-bl-2xl rounded-tr-lg cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            // In a real app, you would dispatch an action here to update favorites.
            console.log(`Toggled favorite for ${product.name}`);
          }}
        >
          <Heart className="h-5 w-5" />
        </div>

        <CardContent className="p-4 pt-8 text-center flex flex-col flex-grow">
            <div className="relative mx-auto h-32 w-32 mb-4 shrink-0">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={product.category.replace(/-/g, ' ')}
                />
            </div>

            <div className="flex-grow">
              <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 h-10 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex justify-between items-center text-left mt-auto">
                <p className="text-lg font-bold text-primary">
                    {isVariant ? 'From ' : ''}Rs{product.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-sm">{product.rating.toFixed(1)}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
