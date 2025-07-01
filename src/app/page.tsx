
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
import { cn } from '@/lib/utils';

// Card component for categories
const CategoryCard = ({
  category,
  className,
  children,
}: {
  category: Category;
  className?: string;
  children: React.ReactNode;
}) => (
  <Link
    href={`/category/${category.id}`}
    className={cn("group relative block overflow-hidden rounded-2xl", className)}
  >
    {children}
  </Link>
);


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
  
  const categoryCards = useMemo(() => categories.slice(0, 6), [categories]);

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
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8 font-headline">Product Categories</h2>
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] lg:auto-rows-[minmax(0,_1fr)]">
                <Skeleton className="lg:col-span-2 lg:row-span-2 rounded-2xl h-full min-h-[300px] lg:min-h-0"/>
                <Skeleton className="rounded-2xl" />
                <Skeleton className="rounded-2xl" />
                <Skeleton className="rounded-2xl" />
                <Skeleton className="rounded-2xl" />
                <Skeleton className="rounded-2xl" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] lg:auto-rows-[minmax(0,_1fr)]">
              {categoryCards.length > 0 && (
                <CategoryCard category={categoryCards[0]} className="lg:col-span-2 lg:row-span-2">
                  <div className="bg-gray-100 dark:bg-zinc-900 h-full w-full p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="md:w-1/2 text-left w-full">
                      <p className="text-muted-foreground uppercase tracking-wider">{categoryCards[0].description || 'Featured'}</p>
                      <h3 className="text-3xl lg:text-4xl font-bold text-foreground mt-1">{categoryCards[0].name}</h3>
                      <Button className="mt-6 bg-foreground text-background hover:bg-foreground/80 font-bold py-2 px-4 rounded-lg inline-flex items-center">
                        <span>Shop Now</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="md:w-1/2 h-48 md:h-full w-full relative">
                      <Image src="https://placehold.co/400x300.png" data-ai-hint="sofa pillow" alt={categoryCards[0].name} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                </CategoryCard>
              )}
              {categoryCards.length > 1 && (
                <CategoryCard category={categoryCards[1]}>
                  <div className="bg-cyan-100 dark:bg-cyan-900/40 h-full w-full p-6 flex flex-col">
                    <div>
                      <p className="text-cyan-800 dark:text-cyan-200/80 uppercase tracking-wider text-sm">{categoryCards[1].description || 'Top Picks'}</p>
                      <h3 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 mt-1">{categoryCards[1].name}</h3>
                    </div>
                    <div className="relative mt-auto -mb-6 -mr-6 h-full w-full">
                      <Image src="https://placehold.co/200x200.png" data-ai-hint="running shoes" alt={categoryCards[1].name} fill className="object-contain transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6" />
                    </div>
                  </div>
                </CategoryCard>
              )}
              {categoryCards.length > 2 && (
                <CategoryCard category={categoryCards[2]}>
                  <div className="bg-yellow-100 dark:bg-yellow-900/40 h-full w-full p-6 flex flex-col">
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200/80 uppercase tracking-wider text-sm">{categoryCards[2].description || 'Fun Times'}</p>
                      <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{categoryCards[2].name}</h3>
                    </div>
                    <div className="relative mt-auto -mb-6 h-full w-full">
                      <Image src="https://placehold.co/200x200.png" data-ai-hint="toy train" alt={categoryCards[2].name} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                </CategoryCard>
              )}
              {categoryCards.length > 3 && (
                <CategoryCard category={categoryCards[3]}>
                  <div className="bg-pink-100 dark:bg-pink-900/40 h-full w-full p-6 flex flex-col">
                     <div>
                      <p className="text-pink-800 dark:text-pink-200/80 uppercase tracking-wider text-sm">{categoryCards[3].description || 'Decor'}</p>
                      <h3 className="text-2xl font-bold text-pink-900 dark:text-pink-100 mt-1">{categoryCards[3].name}</h3>
                    </div>
                    <div className="relative mt-auto h-full w-full">
                      <Image src="https://placehold.co/200x200.png" data-ai-hint="art frame" alt={categoryCards[3].name} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                </CategoryCard>
              )}
              {categoryCards.length > 4 && (
                <CategoryCard category={categoryCards[4]}>
                  <div className="bg-green-100 dark:bg-green-900/40 h-full w-full p-6 flex flex-col">
                     <div>
                      <p className="text-green-800 dark:text-green-200/80 uppercase tracking-wider text-sm">{categoryCards[4].description || 'Celebrations'}</p>
                      <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{categoryCards[4].name}</h3>
                    </div>
                    <div className="relative mt-auto -mb-6 h-full w-full">
                      <Image src="https://placehold.co/200x200.png" data-ai-hint="party hats" alt={categoryCards[4].name} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                </CategoryCard>
              )}
              {categoryCards.length > 5 && (
                <CategoryCard category={categoryCards[5]}>
                   <div className="bg-rose-100 dark:bg-rose-900/40 h-full w-full p-6 flex flex-col items-start">
                     <div>
                      <p className="text-rose-800 dark:text-rose-200/80 uppercase tracking-wider text-sm">{categoryCards[5].description || 'Luxury'}</p>
                      <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mt-1">{categoryCards[5].name}</h3>
                       <Button variant="link" className="text-rose-900 dark:text-rose-100 px-0 h-auto">Shop Now</Button>
                    </div>
                    <div className="relative mt-auto -mb-6 -mr-6 h-full w-full self-end">
                      <Image src="https://placehold.co/200x200.png" data-ai-hint="diamond ring" alt={categoryCards[5].name} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                </CategoryCard>
              )}
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
