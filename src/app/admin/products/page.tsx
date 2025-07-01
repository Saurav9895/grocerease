"use client";

import { useEffect, useState } from "react";
import { ProductTable } from "@/components/admin/ProductTable";
import { getProducts, getCategories } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [allProducts, allCategories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    setProducts(allProducts);
    setCategories(allCategories);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Products</h1>
      {isLoading ? (
        <div className="border rounded-md">
            <div className="p-4 flex justify-end"><Skeleton className="h-10 w-36" /></div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
      ) : (
        <ProductTable 
          products={products} 
          categories={categories} 
          onDataChanged={fetchData} 
        />
      )}
    </div>
  );
}
