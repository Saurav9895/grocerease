
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryCarousel } from '@/components/shop/CategoryCarousel';


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const searchResults = useMemo(() => {
    if (!searchQuery) {
        return [];
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lowercasedQuery) ||
        p.description.toLowerCase().includes(lowercasedQuery)
    ).slice(0, 5);
  }, [searchQuery, products]);
  
  const handleResultClick = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
  }

  const showSearchResults = isSearchFocused && searchQuery.length > 0;

  return (
    <div className="container py-8">
       <section className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary font-headline">
          Welcome to GrocerEase!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Your favorite groceries, delivered fresh to your doorstep. Explore our wide selection of quality products.
        </p>
        <div ref={searchContainerRef} className="mt-8 max-w-xl mx-auto relative">
            <div className="flex items-center">
                 <div className="relative w-full">
                    <Input 
                        type="search"
                        placeholder="Search for groceries..."
                        className="text-base h-12 rounded-r-none focus-visible:ring-offset-0 focus-visible:ring-1 pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                    />
                    {searchQuery && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
                <Button size="icon" className="h-12 w-12 rounded-l-none bg-primary hover:bg-primary/90">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                </Button>
            </div>
            
            {showSearchResults && (
                 <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 text-left">
                     {searchResults.length > 0 ? (
                        <ul className="py-2">
                            {searchResults.map(product => (
                                <li key={product.id}>
                                    <Link 
                                        href={`/product/${product.id}`} 
                                        onClick={handleResultClick} 
                                        className="flex items-center gap-4 px-4 py-2 hover:bg-muted transition-colors"
                                    >
                                        <Image 
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded-md object-cover"
                                            data-ai-hint="product image"
                                        />
                                        <span>{product.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="p-4 text-center text-muted-foreground">No products found for &quot;{searchQuery}&quot;</p>
                     )}
                 </div>
            )}
        </div>
         <div className="mt-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-base">
                <Link href="/products">Browse All Products</Link>
            </Button>
        </div>
      </section>

      <section id="categories" className="mb-16">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Category</h2>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : (
          <CategoryCarousel categories={categories} />
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
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
                <p className="text-lg font-medium">No products available yet.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
