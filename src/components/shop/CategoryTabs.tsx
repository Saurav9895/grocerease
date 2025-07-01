"use client";

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category } from '@/lib/types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
