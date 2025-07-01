"use client";

import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

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

  const featuredCategories = categories.slice(0, 4);

  return (
    <div className="container py-8">
      <section className="mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
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
          <div className="absolute top-1/2 left-16 -translate-y-1/2">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg max-w-md">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">
                Fresh Groceries, Delivered Daily
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Quality ingredients, unbeatable prices. Your one-stop shop for all things fresh.
              </p>
              <Button asChild size="lg" className="mt-6">
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
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
        ) : (
            <>
              {featuredCategories.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <CategoryCard category={featuredCategories[0]} className="col-span-2 row-span-2">
                        <Image src={featuredCategories[0].imageUrl} alt={featuredCategories[0].name} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={featuredCategories[0].name.toLowerCase().split(' ').slice(0,2).join(' ')} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                          <h3 className="text-2xl font-bold text-white">{featuredCategories[0].name}</h3>
                          <p className="text-white/90 truncate">{featuredCategories[0].description}</p>
                          <div className={cn(buttonVariants({ variant: 'secondary' }), "mt-4 self-start")}>
                              Shop Now
                          </div>
                      </div>
                    </CategoryCard>
                    {featuredCategories.slice(1).map((cat) => (
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
