
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
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
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // State for form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (profile?.vendorId) {
      setIsLoading(true);
      getVendorById(profile.vendorId)
        .then(vendorData => {
          if (vendorData) {
            setVendor(vendorData);
            setName(vendorData.name);
            setDescription(vendorData.description);
            setStreet(vendorData.address?.street || "");
            setCity(vendorData.address?.city || "");
            setState(vendorData.address?.state || "");
            setZip(vendorData.address?.zip || "");
            setCountry(vendorData.address?.country || "");
            setGoogleMapsUrl(vendorData.address?.googleMapsUrl);
          }
          setIsLoading(false);
        });
    }
  }, [profile?.vendorId]);

  const handleMapConfirm = (addressFromMap: Partial<Address>) => {
    setStreet(addressFromMap.street || "");
    setCity(addressFromMap.city || "");
    setState(addressFromMap.state || "");
    setZip(addressFromMap.zip || "");
    setCountry(addressFromMap.country || "");
    setGoogleMapsUrl(addressFromMap.googleMapsUrl);
    setIsMapOpen(false);
    toast({ title: "Location Set", description: "Address details have been populated from the map. Click 'Save' to confirm." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setIsSaving(true);
    try {
      const addressPayload: Address = {
        name: name, // Use vendor name for address name
        street: street,
        city: city,
        state: state,
        zip: zip,
        country: country,
        phone: '', // Vendor phone is not stored here
        googleMapsUrl: googleMapsUrl,
      };

      await updateVendorDetails(vendor.id, { name, description, address: addressPayload });
      toast({ title: "Shop details updated successfully!" });
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
    return null;
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Shop Name</Label>
            <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-description">Shop Description</Label>
            <Textarea id="vendor-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers a little about your shop." rows={4} />
          </div>
          
          <Separator className="!my-6" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label>Shop Location</Label>
                <p className="text-sm text-muted-foreground">Set your physical shop location for pickups and maps.</p>
              </div>
              <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline"><MapPin className="mr-2 h-4 w-4" /> Set with Map</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl p-0">
                  <DialogHeader className="sr-only"><DialogTitle>Set Shop Location</DialogTitle><DialogDescription>Drag the map to pinpoint your address or use the search bar.</DialogDescription></DialogHeader>
                  {isMapOpen && <GoogleMapPicker onConfirm={handleMapConfirm} onClose={() => setIsMapOpen(false)} />}
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2"><Label htmlFor="shop-street">Street Address</Label><Input id="shop-street" value={street} onChange={(e) => setStreet(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="shop-city">City</Label><Input id="shop-city" value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="shop-state">State / Province</Label><Input id="shop-state" value={state} onChange={(e) => setState(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="shop-zip">ZIP / Postal Code</Label><Input id="shop-zip" value={zip} onChange={(e) => setZip(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="shop-country">Country</Label><Input id="shop-country" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="!mt-6 w-full">
            {isSaving ? "Saving..." : "Save Shop Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
