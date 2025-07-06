
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleVendorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/vendor/${product.vendorId}`);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <Card className="relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4 pt-8 flex flex-col flex-grow">
            <div className="relative mx-auto h-32 w-32 mb-4 shrink-0">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={product.category.replace(/-/g, ' ')}
                />
            </div>

            <div className="flex-grow flex flex-col justify-center text-left">
              <p className="text-xs text-muted-foreground">
                <span onClick={handleVendorClick} className="hover:underline cursor-pointer">
                    {product.vendorName}
                </span>
              </p>
              <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
            </div>

            <div className="flex justify-between items-center text-left mt-auto pt-4">
                <p className="text-lg font-bold text-primary">
                    {product.hasVariants ? 'From ' : ''}Rs{product.price.toFixed(2)}
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
