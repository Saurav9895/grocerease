"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDataChanged: () => void;
}

export function CategoryTable({ categories, onEdit, onDataChanged }: CategoryTableProps) {
  const { toast } = useToast();

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      toast({ title: "Category deleted successfully" });
      onDataChanged();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ variant: "destructive", title: "Failed to delete category", description: "An unexpected error occurred." });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category List</CardTitle>
        <CardDescription>View, edit, or delete product categories.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="hidden md:grid grid-cols-[64px_1fr_2fr_150px] items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <span>Image</span>
          <span>Name</span>
          <span>Description</span>
          <span className="text-right">Actions</span>
        </div>
        
        <div className="divide-y divide-border">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="grid grid-cols-[64px_1fr_auto] md:grid-cols-[64px_1fr_2fr_150px] items-center gap-4 px-4 py-3">
                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover" data-ai-hint={category.name.toLowerCase()} />
                </div>
                <div className="font-medium truncate" title={category.name}>{category.name}</div>
                <div className="hidden md:block text-sm text-muted-foreground truncate" title={category.description}>{category.description || '-'}</div>
                <div className="flex justify-end items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                    <Pencil className="h-3 w-3 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-3 w-3 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the category.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No categories found.</p>
              <p>Add one to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
