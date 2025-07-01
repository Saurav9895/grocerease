
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/utils';


const displayCategories = [
    { name: 'Grocery', discount: 'upto 15% off', Icon: (props: any) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 21.82a2 2 0 0 0 4 0" />
            <path d="M5.18 5.18A2 2 0 0 0 3.75 7H2.25A2 2 0 0 0 .25 9l1.22 7.32A2 2 0 0 0 3.44 18h17.12a2 2 0 0 0 1.97-1.68L23.75 9a2 2 0 0 0-2-2h-1.5a2 2 0 0 0-1.43-1.82" />
            <path d="M8 12a2 2 0 1 1-4 0" />
            <path d="M12 12a2 2 0 1 1-4 0" />
            <path d="M16 12a2 2 0 1 1-4 0" />
            <path d="M20 12a2 2 0 1 1-4 0" />
            <path d="M16 7a2 2 0 1 1-4 0" />
        </svg>
    ), bgColor: 'bg-green-100', textColor: 'text-green-800', id: 'vegetables-and-fruits' },
    { name: 'Vegetables', discount: 'upto 10% off', Icon: (props: any) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 15.5c.6-1.1 1.6-2.5 1.6-2.5-2.2-2.7-4-1.5-4-1.5-.2 2.2 1.4 4.5 1.4 4.5.9 1.1 2.3.9 2.3.9z" />
            <path d="M11 16c-1.8-1.5-2.5-3.1-2.5-3.1-2.8-.2-4.6 1.3-4.6 1.3s1.2 2.9 4.1 3.2c0 0 .9 1.5 2.5 1.5C12.5 19 11 16 11 16z" />
            <path d="M10 14c-2.3-1.4-2.5-3-2.5-3-3.1.2-4.5 1.6-4.5 1.6s1.6 2.7 4.5 2.6c0 0 1.3 1.5 2.5 1.5s2.5-2.5 2.5-2.5c1.1.8 1.9 1.6 1.9 1.6s.6-1.2-.5-2.4c-1.1-1.2-2.1-1.7-2.1-1.7s-.2 1.9-1.8 3.2z" />
        </svg>
    ), bgColor: 'bg-orange-100', textColor: 'text-orange-800', id: 'vegetables-and-fruits' },
    { name: 'Grocery', discount: 'upto 15% off', Icon: (props: any) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 21.82a2 2 0 0 0 4 0" />
            <path d="M5.18 5.18A2 2 0 0 0 3.75 7H2.25A2 2 0 0 0 .25 9l1.22 7.32A2 2 0 0 0 3.44 18h17.12a2 2 0 0 0 1.97-1.68L23.75 9a2 2 0 0 0-2-2h-1.5a2 2 0 0 0-1.43-1.82" />
            <path d="M8 12a2 2 0 1 1-4 0" />
            <path d="M12 12a2 2 0 1 1-4 0" />
            <path d="M16 12a2 2 0 1 1-4 0" />
            <path d="M20 12a2 2 0 1 1-4 0" />
            <path d="M16 7a2 2 0 1 1-4 0" />
        </svg>
    ), bgColor: 'bg-blue-100', textColor: 'text-blue-800', id: 'vegetables-and-fruits' },
    { name: 'Vegetables', discount: 'upto 10% off', Icon: (props: any) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 15.5c.6-1.1 1.6-2.5 1.6-2.5-2.2-2.7-4-1.5-4-1.5-.2 2.2 1.4 4.5 1.4 4.5.9 1.1 2.3.9 2.3.9z" />
            <path d="M11 16c-1.8-1.5-2.5-3.1-2.5-3.1-2.8-.2-4.6 1.3-4.6 1.3s1.2 2.9 4.1 3.2c0 0 .9 1.5 2.5 1.5C12.5 19 11 16 11 16z" />
            <path d="M10 14c-2.3-1.4-2.5-3-2.5-3-3.1.2-4.5 1.6-4.5 1.6s1.6 2.7 4.5 2.6c0 0 1.3 1.5 2.5 1.5s2.5-2.5 2.5-2.5c1.1.8 1.9 1.6 1.9 1.6s.6-1.2-.5-2.4c-1.1-1.2-2.1-1.7-2.1-1.7s-.2 1.9-1.8 3.2z" />
        </svg>
    ), bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', id: 'vegetables-and-fruits' },
     { name: 'Grocery', discount: 'upto 15% off', Icon: (props: any) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 21.82a2 2 0 0 0 4 0" />
            <path d="M5.18 5.18A2 2 0 0 0 3.75 7H2.25A2 2 0 0 0 .25 9l1.22 7.32A2 2 0 0 0 3.44 18h17.12a2 2 0 0 0 1.97-1.68L23.75 9a2 2 0 0 0-2-2h-1.5a2 2 0 0 0-1.43-1.82" />
            <path d="M8 12a2 2 0 1 1-4 0" />
            <path d="M12 12a2 2 0 1 1-4 0" />
            <path d="M16 12a2 2 0 1 1-4 0" />
            <path d="M20 12a2 2 0 1 1-4 0" />
            <path d="M16 7a2 2 0 1 1-4 0" />
        </svg>
    ), bgColor: 'bg-red-100', textColor: 'text-red-800', id: 'vegetables-and-fruits' },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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


  return (
    <div className="container py-8">
      <section className="mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src="https://placehold.co/1200x350.png"
            alt="Hero background"
            width={1200}
            height={350}
            className="w-full h-full object-cover"
            data-ai-hint="groceries background"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-1/2 left-16 -translate-y-1/2">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg max-w-md">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">
                InstaGrocer
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Sample text to describe 1daycart in simple words
              </p>
              <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mb-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
                Shop by category
            </h2>
            <Button variant="ghost" asChild>
                <Link href="/products" className="text-sm font-medium">
                    See all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
        </div>
        {isLoading ? (
             <div className="flex space-x-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-48 h-24 rounded-lg" />)}
            </div>
        ) : (
            <div className="flex space-x-4 overflow-x-auto pb-4 -ml-4 pl-4">
                {displayCategories.map((category, index) => (
                    <Link href={`/category/${category.id}`} key={index} className="flex-shrink-0">
                        <div className={cn("w-48 h-24 rounded-lg p-4 flex justify-between items-center", category.bgColor)}>
                            <div className={cn("font-semibold", category.textColor)}>
                                <h3 className="text-base">{category.name}</h3>
                                <p className="text-xs">{category.discount}</p>
                            </div>
                            <category.Icon className={cn("h-12 w-12", category.textColor)} />
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </section>

      <section id="products">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight font-headline">
                Buy again
            </h2>
            <Button variant="ghost" asChild>
                <Link href="/products" className="text-sm font-medium">
                    See more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {products.slice(0, 10).map((product) => (
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
