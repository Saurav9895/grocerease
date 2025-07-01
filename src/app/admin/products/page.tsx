"use client";

import { useEffect, useState } from "react";
import { ProductTable } from "@/components/admin/ProductTable";
import { getProducts } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        setIsLoading(true);
        const allProducts = await getProducts();
        setProducts(allProducts);
        setIsLoading(false);
      };
      fetchProducts();
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
        <ProductTable products={products} />
      )}
    </div>
  );
}
