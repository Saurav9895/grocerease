"use client";

import { useEffect, useState } from "react";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { getCategories } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        setIsLoading(true);
        const allCategories = await getCategories();
        setCategories(allCategories);
        setIsLoading(false);
      };
      fetchCategories();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Categories</h1>
      {isLoading ? (
         <div className="border rounded-md">
            <div className="p-4 flex justify-end"><Skeleton className="h-10 w-36" /></div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      ) : (
        <CategoryTable categories={categories} />
      )}
    </div>
  );
}
