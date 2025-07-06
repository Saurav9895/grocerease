"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getVendorById, updateVendorDetails } from "@/lib/data";
import type { Vendor } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Store } from "lucide-react";

export function VendorProfileManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (profile?.vendorId) {
      setIsLoading(true);
      getVendorById(profile.vendorId)
        .then(vendorData => {
          if (vendorData) {
            setVendor(vendorData);
            setName(vendorData.name);
            setDescription(vendorData.description);
          }
          setIsLoading(false);
        });
    }
  }, [profile?.vendorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setIsSaving(true);
    try {
      await updateVendorDetails(vendor.id, { name, description });
      toast({ title: "Shop details updated successfully!" });
      // Refresh local state after update
      const updatedVendor = await getVendorById(vendor.id);
       if (updatedVendor) {
            setVendor(updatedVendor);
            setName(updatedVendor.name);
            setDescription(updatedVendor.description);
        }
    } catch (error) {
      console.error("Error updating vendor details:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update your shop details." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-24" />
            </CardContent>
        </Card>
    )
  }

  if (!vendor) {
    return null; // Or show an error state if a vendorId exists but no vendor is found
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5"/> Vendor Profile
        </CardTitle>
        <CardDescription>Manage your public shop name and description.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Shop Name</Label>
            <Input
              id="vendor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-description">Shop Description</Label>
            <Textarea
              id="vendor-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers a little about your shop."
              rows={4}
            />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Shop Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
