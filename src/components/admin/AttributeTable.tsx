"use client";

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
import type { AttributeSet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAttribute } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

interface AttributeTableProps {
  attributes: AttributeSet[];
  onEdit: (attribute: AttributeSet) => void;
  onDataChanged: () => void;
}

export function AttributeTable({ attributes, onEdit, onDataChanged }: AttributeTableProps) {
  const { toast } = useToast();

  const handleDelete = async (attributeId: string) => {
    try {
      await deleteAttribute(attributeId);
      toast({ title: "Attribute deleted successfully" });
      onDataChanged();
    } catch (error) {
      console.error("Error deleting attribute:", error);
      toast({ variant: "destructive", title: "Failed to delete attribute", description: "An unexpected error occurred." });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attribute List</CardTitle>
        <CardDescription>View, edit, or delete reusable product attributes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden md:grid grid-cols-[1fr_2fr_150px] items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <span>Name</span>
          <span>Values</span>
          <span className="text-right">Actions</span>
        </div>
        
        <div className="divide-y divide-border">
          {attributes.length > 0 ? (
            attributes.map((attr) => (
              <div key={attr.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_2fr_150px] items-center gap-4 px-4 py-3">
                <div className="font-medium truncate" title={attr.name}>{attr.name}</div>
                <div className="flex flex-wrap gap-1">
                    {attr.values.map(val => <Badge key={val} variant="outline">{val}</Badge>)}
                </div>
                <div className="flex justify-end items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(attr)}>
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
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the attribute.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(attr.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No attributes found.</p>
              <p>Add one to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
