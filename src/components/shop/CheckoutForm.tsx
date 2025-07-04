
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { z } from "zod";
import type { Address, Order } from "@/lib/types";
import { getUserAddresses, saveUserAddress, createOrderAndDecreaseStock } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import type { MapPickerProps } from '@/components/common/MapPicker';
import type { LatLng } from "leaflet";

const MapPicker = dynamic<MapPickerProps>(() => import('@/components/common/MapPicker').then(mod => mod.MapPicker), {
    loading: () => <div className="h-[400px] w-full rounded-md border bg-muted animate-pulse" />,
    ssr: false,
});

const addressSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  phone: z.string().min(10, "Please enter a valid phone number.").max(15),
  street: z.string().min(5, "Street address is too short."),
  city: z.string().min(2, "City is too short."),
  state: z.string().min(2, "State/Province is too short."),
  zip: z.string().min(4, "Invalid ZIP/Postal code."),
  country: z.string().min(2, "Country is too short."),
});

const initialAddressState: Address = {
  name: '', phone: '', street: '', city: '', state: '', zip: '', country: ''
};

interface CheckoutFormProps {
  deliveryFee: number;
  discountAmount?: number;
  promoCode?: string;
  total: number;
}

export function CheckoutForm({ deliveryFee, discountAmount, promoCode, total }: CheckoutFormProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  const [formData, setFormData] = useState<Address>(initialAddressState);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [saveAddress, setSaveAddress] = useState(true);
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  
  const [isMapOpen, setIsMapOpen] = useState(false);


  useEffect(() => {
    if (user) {
      setIsLoadingAddresses(true);
      getUserAddresses(user.uid)
        .then(addresses => {
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id!);
          }
        })
        .finally(() => {
          setIsLoadingAddresses(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (selectedAddressId === 'new') {
      setFormData(initialAddressState);
    } else {
      const selected = savedAddresses.find(a => a.id === selectedAddressId);
      if (selected) {
        const { id, ...addressData } = selected;
        setFormData(addressData);
      }
    }
  }, [selectedAddressId, savedAddresses]);

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
        toast({ title: "Address Updated", description: "Address fields filled from map." });
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

    if (!user || cartItems.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in and have items in your cart." });
      setIsLoading(false);
      return;
    }

    const validatedFields = addressSchema.safeParse(formData);
    if (!validatedFields.success) {
      const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join('\n');
      toast({ variant: "destructive", title: "Invalid data", description: errorMessages || "Please check your shipping details." });
      setIsLoading(false);
      return;
    }

    try {
      if (saveAddress && selectedAddressId === 'new') {
        await saveUserAddress(user.uid, validatedFields.data);
      }
      
      const newOrderPayload: Omit<Order, 'id' | 'createdAt'> = {
        userId: user.uid,
        customerName: validatedFields.data.name,
        address: validatedFields.data,
        items: cartItems,
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        discountAmount: discountAmount || 0,
        promoCode: promoCode || null,
        total: total,
        paymentMethod: paymentMethod as 'COD' | 'Online',
        status: 'Pending' as const,
      };
      
      const orderId = await createOrderAndDecreaseStock(newOrderPayload);

      toast({ title: "Order Placed!", description: "Your order has been successfully placed." });
      clearCart();
      router.push(`/orders/${orderId}`);

    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({ variant: "destructive", title: "Order Failed", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address-select">Saved Addresses</Label>
            {isLoadingAddresses ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={setSelectedAddressId} value={selectedAddressId}>
                <SelectTrigger id="address-select">
                  <SelectValue placeholder="Select a saved address" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">-- Enter a new address --</SelectItem>
                  {savedAddresses.map((addr) => (
                    <SelectItem key={addr.id!} value={addr.id!}>
                      {addr.name}, {addr.street}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex justify-end">
             <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
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
                  {isMapOpen && <MapPicker onConfirm={handleMapConfirm} />}
                </DialogContent>
              </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
            </div>
          </div>
          {selectedAddressId === 'new' && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="saveAddress" checked={saveAddress} onCheckedChange={(checked) => setSaveAddress(!!checked)} />
              <Label htmlFor="saveAddress" className="cursor-pointer">Save this address for future purchases</Label>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                <RadioGroupItem value="COD" id="cod" />
                <span>Cash on Delivery (COD)</span>
              </Label>
              <Label className="flex items-center gap-2 p-4 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed">
                <RadioGroupItem value="Online" id="online" disabled />
                <span>Online Payment (Coming Soon)</span>
              </Label>
            </RadioGroup>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading || isLoadingAddresses}>
        {isLoading ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
