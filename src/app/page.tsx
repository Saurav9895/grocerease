
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, getCategories, getHomepageSettings, getProductsByIds, getCategoriesByIds } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

function CategoryCard({ category, className, children }: React.PropsWithChildren<CategoryCardProps>) {
  return (
    <Link
      href={`/category/${category.id}`}
      className={cn("group relative block overflow-hidden rounded-2xl", className)}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${searchQuery.trim()}`);
      setIsResultsVisible(false);
    }
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setIsResultsVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [productsData, categoriesData, homepageSettings] = await Promise.all([
        getProducts(),
        getCategories(),
        getHomepageSettings(),
      ]);
      setAllProducts(productsData);
      
      let featuredData: Product[];
      if (homepageSettings.featuredProductIds && homepageSettings.featuredProductIds.length > 0) {
          featuredData = await getProductsByIds(homepageSettings.featuredProductIds);
      } else {
          featuredData = productsData.slice(0, 4);
      }
      setFeaturedProducts(featuredData);

      let featuredCategoriesData: Category[];
      if (homepageSettings.featuredCategoryIds && homepageSettings.featuredCategoryIds.length > 0) {
        featuredCategoriesData = await getCategoriesByIds(homepageSettings.featuredCategoryIds);
      } else {
        featuredCategoriesData = categoriesData.slice(0, 5);
      }
      setCategories(featuredCategoriesData);

      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsResultsVisible(false);
      return;
    }

    const filtered = allProducts
      .filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5); 

    setSearchResults(filtered);
    setIsResultsVisible(filtered.length > 0);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsResultsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="container py-8">
      <section className="mb-12">
        <div className="relative rounded-2xl bg-gray-100 h-[400px] md:h-[350px]">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <Image
              src="https://img.freepik.com/free-vector/grocery-store-sale-banner-template_23-2151089846.jpg"
              alt="Hero background"
              width={1200}
              height={350}
              className="w-full h-full object-cover"
              data-ai-hint="grocery sale"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="absolute z-10 top-1/2 left-1/2 w-11/12 -translate-x-1/2 -translate-y-1/2 md:left-16 md:w-auto md:translate-x-0">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg max-w-md mx-auto md:mx-0 md:p-8">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary font-headline">
                Fresh Groceries, Delivered Daily
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Quality ingredients, unbeatable prices. Your one-stop shop for all things fresh.
              </p>
              
              <div ref={searchContainerRef} className="relative mt-6 md:hidden">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input 
                    placeholder="Search products..." 
                    className="h-12 pr-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="absolute right-1 top-1 h-10 w-10">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Button>
                </form>
                {isResultsVisible && (
                  <div className="absolute top-full mt-2 w-full bg-card border rounded-md shadow-lg z-50">
                      <ul className="py-1">
                      {searchResults.map(product => (
                          <li key={product.id}>
                          <Link 
                              href={`/product/${product.id}`} 
                              className="flex items-center gap-3 px-3 py-2 hover:bg-accent"
                              onClick={handleResultClick}
                          >
                              <Image src={product.imageUrl} alt={product.name} width={32} height={32} className="rounded-sm object-cover" data-ai-hint={product.category.replace(/-/g, ' ')} />
                              <span className="text-sm font-medium">{product.name}</span>
                          </Link>
                          </li>
                      ))}
                      </ul>
                  </div>
                )}
              </div>


              <Button asChild size="lg" className="mt-6 hidden md:inline-flex">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Product Categories</h2>
         {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
        ) : (
            <>
              {categories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <CategoryCard category={categories[0]} className="col-span-2 row-span-2">
                        <Image src={categories[0].imageUrl} alt={categories[0].name} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={categories[0].name.toLowerCase().split(' ').slice(0,2).join(' ')} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                          <h3 className="text-2xl font-bold text-white">{categories[0].name}</h3>
                          <p className="text-white/90 truncate">{categories[0].description}</p>
                          <div className={cn(buttonVariants({ variant: 'secondary' }), "mt-4 self-start")}>
                              Shop Now
                          </div>
                      </div>
                    </CategoryCard>
                    {categories.slice(1).map((cat) => (
                      <CategoryCard key={cat.id} category={cat}>
                          <Image src={cat.imageUrl} alt={cat.name} width={300} height={200} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={cat.name.toLowerCase().split(' ').slice(0,2).join(' ')} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                              <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                              <p className="text-sm text-white/90 truncate">{cat.description}</p>
                          </div>
                      </CategoryCard>
                    ))}
                </div>
              ) : (
                 <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
                  <p className="text-lg font-medium">No categories available yet.</p>
                </div>
              )}
            </>
        )}
      </section>


      <section id="products">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight font-headline">
                Featured Products
            </h2>
            <Button variant="ghost" asChild>
                <Link href="/products" className="text-sm font-medium">
                    See more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
          </div>
        ) : (
          <>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
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
