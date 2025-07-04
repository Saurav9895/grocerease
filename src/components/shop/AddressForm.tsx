
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAuth } from "@/context/AuthProvider";
import { saveUserAddress, updateUserAddress } from "@/lib/data";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import dynamic from 'next/dynamic';
import { Skeleton } from "../ui/skeleton";

const GoogleMapPicker = dynamic(() => import('@/components/common/GoogleMapPicker').then(mod => mod.GoogleMapPicker), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />
});

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
}

const addressSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  phone: z.string().min(10, "Please enter a valid phone number.").max(15),
  apartment: z.string().optional(),
  street: z.string().min(5, "Street address is too short."),
  city: z.string().min(2, "City is too short."),
  state: z.string().min(2, "State/Province is too short."),
  zip: z.string().min(4, "Invalid ZIP/Postal code."),
  country: z.string().min(2, "Country is too short."),
});

const initialAddressState: Omit<Address, 'id'> = {
  name: '', phone: '', apartment: '', street: '', city: '', state: '', zip: '', country: ''
};

export function AddressForm({ address, onSuccess }: AddressFormProps) {
  const isEditing = !!address;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialAddressState);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
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
  
  const handleMapConfirm = (addressFromMap: Partial<Address>) => {
    setFormData(prev => ({
        ...prev,
        ...addressFromMap,
        name: prev.name,
        phone: prev.phone,
        apartment: prev.apartment,
    }));
  };

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
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                    <MapPin className="mr-2 h-4 w-4" />
                    Select Address on Map
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select Delivery Location</DialogTitle>
                    <DialogDescription>
                        Click on the map or drag the marker to set your address.
                    </DialogDescription>
                </DialogHeader>
                {isMapOpen && <GoogleMapPicker onConfirm={handleMapConfirm} onClose={() => setIsMapOpen(false)} />}
            </DialogContent>
        </Dialog>

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
            <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
            <Input id="apartment" name="apartment" value={formData.apartment || ''} onChange={handleInputChange} />
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
