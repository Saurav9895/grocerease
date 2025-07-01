
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductsByCategory, getCategoryById } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPrice, setMaxPrice] = useState(500);

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
        
        if (productsData.length > 0) {
            const maxProductPrice = Math.max(...productsData.map(p => p.price));
            const finalMaxPrice = Math.ceil(maxProductPrice) > 0 ? Math.ceil(maxProductPrice) : 500;
            setMaxPrice(finalMaxPrice);
            setPriceRange([0, finalMaxPrice]);
        }

        setIsLoading(false);
      };
      fetchData();
    }
  }, [slug]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowercasedQuery) ||
            p.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    const sorted = [...filtered].sort((a, b) => {
        switch (sortOption) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    return sorted;
  }, [products, searchQuery, sortOption, priceRange]);
  
  const handlePriceChange = (value: number[]) => {
      setPriceRange([value[0], value[1]]);
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
         <div className="mb-8 p-4 border rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-full" />
                </div>
            </div>
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

       <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-4 border rounded-lg bg-card">
                <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            id="search"
                            type="search"
                            placeholder="Search in this category..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="price-range" className="block mb-4">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                        id="price-range"
                        min={0}
                        max={maxPrice}
                        step={1}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                    />
                </div>
                
                <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                     <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger id="sort-by" className="w-full">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name-asc">Name: A to Z</SelectItem>
                            <SelectItem value="name-desc">Name: Z to A</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

      {products.length === 0 ? (
         <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
          <p className="text-lg font-medium">No products found in this category yet.</p>
        </div>
      ) : filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
          <p className="text-lg font-medium">No products match your criteria.</p>
          <p>Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
