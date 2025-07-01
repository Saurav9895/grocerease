
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductById, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      const fetchData = async () => {
        setIsLoading(true);
        const [fetchedProduct, fetchedCategories] = await Promise.all([
            getProductById(id),
            getCategories()
        ]);
        setProduct(fetchedProduct);
        setCategories(fetchedCategories);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3 mt-4" />
            <div className="pt-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-24">
        <h1 className="text-4xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mt-4">Sorry, we couldn't find the product you're looking for.</p>
        <Button onClick={() => router.push('/')} className="mt-8">Go Back Home</Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-square rounded-lg overflow-hidden border bg-card">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint="product image"
          />
        </div>
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">{getCategoryName(product.category)}</Badge>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          </div>
          <p className="text-3xl font-semibold text-primary">${product.price.toFixed(2)}</p>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
           <div className="space-y-2">
            <h2 className="text-lg font-semibold">Availability</h2>
            <p className="text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
          </div>
          <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
             <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
