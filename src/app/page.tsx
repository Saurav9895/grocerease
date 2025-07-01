"use client";

import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryTabs } from '@/components/shop/CategoryTabs';
import { Recommendations } from '@/components/shop/Recommendations';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories([{ id: 'all', name: 'All' }, ...categoriesData]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === categoryId));
    }
  };

  return (
    <div className="container py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Fresh Groceries, Delivered Fast
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          From farm-fresh produce to pantry staples, get everything you need delivered to your doorstep.
        </p>
      </section>
      
      <section className="mb-12">
        <Recommendations />
      </section>

      <section id="products">
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Our Products</h2>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <CategoryTabs 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products found in this category.
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
