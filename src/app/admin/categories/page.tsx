"use client";

import { useEffect, useState } from "react";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { getCategories } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/CategoryForm";


export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    const allCategories = await getCategories();
    setCategories(allCategories);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
    fetchCategories(); // Refresh data
  };

  const handleOpenForm = (category: Category | null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">Manage your store's product categories.</p>
        </div>
         <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
          </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setSelectedCategory(null);
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <CategoryForm category={selectedCategory} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
         <div className="border rounded-md bg-card p-6">
            <div className="mb-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        </div>
      ) : (
        <CategoryTable 
          categories={categories} 
          onEdit={handleOpenForm}
          onDataChanged={fetchCategories}
        />
      )}
    </div>
  );
}
