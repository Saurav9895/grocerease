"use client";

import { useState } from 'react';
import { products, categories } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryTabs } from '@/components/shop/CategoryTabs';
import { Recommendations } from '@/components/shop/Recommendations';

export default function Home() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState('all');

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

      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Our Products</h2>
        <div className="mb-6">
          <CategoryTabs 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
