
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
import { useState, useEffect } from "react";
import { z } from "zod";
import type { Address, Order } from "@/lib/types";
import { getUserAddresses, saveUserAddress, createOrderAndDecreaseStock } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import dynamic from 'next/dynamic';

const GoogleMapPicker = dynamic(() => import('@/components/common/GoogleMapPicker').then(mod => mod.GoogleMapPicker), {
    ssr: false,
    loading: () => <Skeleton className="h-[450px] w-full" />
});

const addressSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  phone: z.string().min(10, "Please enter a valid phone number.").max(15),
  apartment: z.string().min(1, "Apartment/suite is required."),
  street: z.string().min(5, "Street address is too short."),
  city: z.string().min(2, "City is too short."),
  state: z.string().min(2, "State/Province is too short."),
  zip: z.string().min(4, "Invalid ZIP/Postal code."),
  country: z.string().min(2, "Country is too short."),
  googleMapsUrl: z.string().url().optional(),
});

const initialAddressState: Address = {
  name: '', phone: '', apartment: '', street: '', city: '', state: '', zip: '', country: '', googleMapsUrl: ''
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
  
  const handleMapConfirm = (addressFromMap: Partial<Address>) => {
    setFormData(prev => ({
        ...prev,
        ...addressFromMap,
        name: prev.name,
        phone: prev.phone,
        apartment: prev.apartment,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
          <div className="flex justify-between items-center">
            <CardTitle>Shipping Address</CardTitle>
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                        <MapPin className="mr-2 h-4 w-4" />
                        Select on Map
                    </Button>
                </DialogTrigger>
                <DialogContent 
                    className="sm:max-w-xl p-0"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>Select Delivery Location</DialogTitle>
                        <DialogDescription>Use the map to pinpoint your exact delivery address.</DialogDescription>
                    </DialogHeader>
                    {isMapOpen && <GoogleMapPicker onConfirm={handleMapConfirm} onClose={() => setIsMapOpen(false)} />}
                </DialogContent>
            </Dialog>
          </div>
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
            <Label htmlFor="apartment">Apartment, suite, etc.</Label>
            <Input id="apartment" name="apartment" value={formData.apartment || ''} onChange={handleInputChange} required disabled={isLoadingAddresses}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required disabled={isLoadingAddresses} />
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
