
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getVendorById, updateVendorDetails } from "@/lib/data";
import type { Vendor, Address } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, MapPin } from "lucide-react";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import dynamic from 'next/dynamic';

const GoogleMapPicker = dynamic(() => import('@/components/common/GoogleMapPicker').then(mod => mod.GoogleMapPicker), {
    ssr: false,
    loading: () => <Skeleton className="h-[450px] w-full" />
});

export function VendorProfileManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState<Partial<Address> | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (profile?.vendorId) {
      setIsLoading(true);
      getVendorById(profile.vendorId)
        .then(vendorData => {
          if (vendorData) {
            setVendor(vendorData);
            setName(vendorData.name);
            setDescription(vendorData.description);
            setAddress(vendorData.address || null);
          }
          setIsLoading(false);
        });
    }
  }, [profile?.vendorId]);

  const handleMapConfirm = (addressFromMap: Partial<Address>) => {
    setAddress(prev => ({
        ...prev,
        ...addressFromMap,
    }));
    setIsMapOpen(false);
    toast({ title: "Location Set", description: "Address details have been updated from the map. Click 'Save' to confirm." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setIsSaving(true);
    try {
      await updateVendorDetails(vendor.id, { name, description, address: address || undefined });
      toast({ title: "Shop details updated successfully!" });
      // Refresh local state after update
      const updatedVendor = await getVendorById(vendor.id);
       if (updatedVendor) {
            setVendor(updatedVendor);
            setName(updatedVendor.name);
            setDescription(updatedVendor.description);
            setAddress(updatedVendor.address || null);
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
        <CardDescription>Manage your public shop name, description, and location.</CardDescription>
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
          
          <Separator className="!my-6" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label>Shop Location</Label>
                <p className="text-sm text-muted-foreground">
                  Set your physical shop location for pickups and maps.
                </p>
              </div>
              <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Set Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl p-0">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Set Shop Location</DialogTitle>
                    <DialogDescription>
                      Drag the map to pinpoint your address or use the search bar.
                    </DialogDescription>
                  </DialogHeader>
                  {isMapOpen && <GoogleMapPicker onConfirm={handleMapConfirm} onClose={() => setIsMapOpen(false)} />}
                </DialogContent>
              </Dialog>
            </div>
            {address && (address.street || address.city) && (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
                {address.googleMapsUrl && (
                  <a href={address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    View on Map
                  </a>
                )}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSaving} className="!mt-6 w-full">
            {isSaving ? "Saving..." : "Save Shop Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
