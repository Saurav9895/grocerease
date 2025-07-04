"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAuth } from "@/context/AuthProvider";
import { saveUserAddress, updateUserAddress } from "@/lib/data";
import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { MapPickerProps } from '@/components/common/MapPicker';
import type { LatLng } from "leaflet";

const MapPicker = dynamic<MapPickerProps>(() => import('@/components/common/MapPicker').then(mod => mod.MapPicker), {
    loading: () => <div className="h-[400px] w-full rounded-md border bg-muted animate-pulse" />,
    ssr: false,
});


interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
}

const addressSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  phone: z.string().min(10, "Please enter a valid phone number.").max(15),
  street: z.string().min(5, "Street address is too short."),
  city: z.string().min(2, "City is too short."),
  state: z.string().min(2, "State/Province is too short."),
  zip: z.string().min(4, "Invalid ZIP/Postal code."),
  country: z.string().min(2, "Country is too short."),
});

const initialAddressState: Omit<Address, 'id'> = {
  name: '', phone: '', street: '', city: '', state: '', zip: '', country: ''
};

export function AddressForm({ address, onSuccess }: AddressFormProps) {
  const isEditing = !!address;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialAddressState);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapPickerKey, setMapPickerKey] = useState(Date.now());


  useEffect(() => {
    if (address) {
        const { id, ...addressData } = address;
        setFormData(addressData);
    } else {
        setFormData(initialAddressState);
    }
  }, [address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapConfirm = useCallback(async (position: LatLng) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`);
      const data = await response.json();
      if (data && data.address) {
        setFormData(prev => ({
          ...prev,
          street: data.address.road || data.address.suburb || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          zip: data.address.postcode || '',
          country: data.address.country || '',
        }));
        toast({ title: "Address Updated", description: "Address fields have been filled from map." });
      } else {
        toast({ variant: "destructive", title: "Could not find address", description: "Please try a different location." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Reverse Geocoding Failed" });
    } finally {
      setIsLoading(false);
      setIsMapOpen(false);
    }
  }, [toast]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!user) {
        toast({ variant: "destructive", title: "Authentication error", description: "You must be logged in." });
        setIsLoading(false);
        return;
    }
    
    const validatedFields = addressSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: errorMessages || "Please check the form fields.",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && address?.id) {
        const addressToUpdate = { ...validatedFields.data, id: address.id };
        await updateUserAddress(user.uid, addressToUpdate);
        toast({ title: "Address updated successfully" });
      } else {
        const newAddress: Omit<Address, 'id'> = { ...validatedFields.data };
        await saveUserAddress(user.uid, newAddress);
        toast({ title: "Address saved successfully" });
      }
      onSuccess();

    } catch (error) {
       console.error("Error saving address:", error);
       toast({
        variant: "destructive",
        title: "Failed to save address",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isMapOpen} onOpenChange={(open) => {
            if (open) setMapPickerKey(Date.now());
            setIsMapOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Select on Map
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Select Delivery Location</DialogTitle>
                <DialogDescription>Click on the map to place a pin or drag it to your exact location.</DialogDescription>
              </DialogHeader>
              <MapPicker key={mapPickerKey} onConfirm={handleMapConfirm} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required />
            </div>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Address'}
        </Button>
    </form>
  );
}
