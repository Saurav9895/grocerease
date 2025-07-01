
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductsByCategory, getCategoryById } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const fetchData = async () => {
        setIsLoading(true);
        const [productsData, categoryData] = await Promise.all([
          getProductsByCategory(slug),
          getCategoryById(slug),
        ]);
        setProducts(productsData);
        setCategory(categoryData);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container text-center py-24">
        <h1 className="text-4xl font-bold">Category Not Found</h1>
        <p className="text-muted-foreground mt-4">Sorry, we couldn't find the category you're looking for.</p>
        <Button onClick={() => router.push('/')} className="mt-8">Go Back Home</Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()} size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
          <p className="text-lg font-medium">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
