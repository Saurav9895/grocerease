"use client";

import { useEffect, useState } from "react";
import { ProductTable } from "@/components/admin/ProductTable";
import { getProducts, getCategories } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsPage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!profile) return;
    setIsLoading(true);

    const productOptions: { vendorId?: string } = {};
    if (profile.adminRole === 'vendor' && profile.vendorId) {
        productOptions.vendorId = profile.vendorId;
    } else if (profile.adminRole !== 'main' && profile.adminRole !== 'standard') {
        // If not a main admin or vendor, they shouldn't see any products in this view
        setProducts([]);
        setCategories([]);
        setIsLoading(false);
        return;
    }

    const [allProducts, allCategories] = await Promise.all([
      getProducts(productOptions),
      getCategories(),
    ]);
    setProducts(allProducts);
    setCategories(allCategories);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && profile) {
      fetchData();
    }
  }, [user, profile]);

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
