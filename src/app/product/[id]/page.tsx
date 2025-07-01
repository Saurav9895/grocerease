
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductById, getCategories, getProductsByCategory } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart, Star, StarHalf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/shop/ProductCard';
import { Separator } from '@/components/ui/separator';

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-muted-foreground/50 fill-muted-foreground/20" />
        ))}
      </div>
    );
  };

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

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

        if (fetchedProduct) {
            setIsLoadingRelated(true);
            const related = await getProductsByCategory(fetchedProduct.category);
            setRelatedProducts(related.filter(p => p.id !== fetchedProduct.id).slice(0, 4));
            setIsLoadingRelated(false);
        }
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
            <Skeleton className="h-6 w-1/2 mt-2" />
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
          <div className="flex items-center gap-2 cursor-pointer" title={`${product.rating} out of 5 stars`}>
            {renderStars(product.rating)}
            <span className="text-muted-foreground text-sm hover:underline">({product.reviewCount} reviews)</span>
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

      <Separator className="my-16" />

      <div id="reviews" className="space-y-8">
        <h2 className="text-3xl font-bold">Ratings & Reviews</h2>
        <div className="p-8 text-center bg-card border rounded-lg">
            <p className="text-muted-foreground">Full review functionality coming soon!</p>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <>
            <Separator className="my-16" />
            <div className="space-y-8">
                <h2 className="text-3xl font-bold">You May Also Like</h2>
                {isLoadingRelated ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </>
      )}

    </div>
  );
}
