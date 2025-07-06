"use client";

import { useEffect, useState } from "react";
import { AttributeTable } from "@/components/admin/AttributeTable";
import { getAttributes } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { AttributeSet } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttributeForm } from "@/components/admin/AttributeForm";


export default function AdminAttributesPage() {
  const { user, profile } = useAuth();
  const [attributes, setAttributes] = useState<AttributeSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeSet | null>(null);

  const fetchAttributes = async () => {
    if (!profile) return;
    setIsLoading(true);

    const fetchOptions: { vendorId?: string } = {};
    if (profile.adminRole === 'vendor' && profile.vendorId) {
        fetchOptions.vendorId = profile.vendorId;
    }
    
    const allAttributes = await getAttributes(fetchOptions);
    setAttributes(allAttributes);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (user && profile) {
      fetchAttributes();
    }
  }, [user, profile]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAttribute(null);
    fetchAttributes(); // Refresh data
  };

  const handleOpenForm = (attribute: AttributeSet | null) => {
    setSelectedAttribute(attribute);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attribute Management</h1>
          <p className="text-muted-foreground">Manage reusable attributes for your products.</p>
        </div>
         <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Attribute
          </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setSelectedAttribute(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAttribute ? 'Edit Attribute' : 'Add New Attribute'}</DialogTitle>
          </DialogHeader>
          <AttributeForm attributeSet={selectedAttribute} onSuccess={handleFormSuccess} profile={profile} />
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
        <AttributeTable
          attributes={attributes} 
          onEdit={handleOpenForm}
          onDataChanged={fetchAttributes}
        />
      )}
    </div>
  );
}
