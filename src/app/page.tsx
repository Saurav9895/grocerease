
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
        return products;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lowercasedQuery) ||
        p.description.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, products]);

  const handleBrowseAllClick = () => {
    setSearchQuery('');
  }

  return (
    <div className="container py-8">
       <section className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary font-headline">
          Welcome to GrocerEase!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Your favorite groceries, delivered fresh to your doorstep. Explore our wide selection of quality products.
        </p>
        <div className="mt-8 max-w-xl mx-auto flex items-center">
            <Input 
                type="search"
                placeholder="Search for groceries..."
                className="text-base h-12 rounded-r-none focus-visible:ring-offset-0 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button size="icon" className="h-12 w-12 rounded-l-none bg-primary hover:bg-primary/90">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>
        </div>
         <div className="mt-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-base">
                <Link href="/#products" onClick={handleBrowseAllClick}>Browse All Products</Link>
            </Button>
        </div>
      </section>

      <section id="categories" className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight mb-8 font-headline">Shop by Category</h2>
        {isLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                ))}
            </div>
        ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {categories.map((category) => (
                    <Link href={`/category/${category.id}`} key={category.id} className="cursor-pointer group block text-center">
                        <div className="aspect-square relative rounded-lg overflow-hidden border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
                            <Image 
                                src={category.imageUrl} 
                                alt={category.name} 
                                fill 
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={category.name.toLowerCase()}
                            />
                        </div>
                        <h3 className="mt-3 font-medium text-lg text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                    </Link>
                ))}
            </div>
        )}
      </section>

      <section id="products">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                Featured Products
            </h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
                <p className="text-lg font-medium">No products found.</p>
                <p>Try adjusting your search query.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
