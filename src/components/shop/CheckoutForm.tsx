"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useState, useRef } from "react";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const checkoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  paymentMethod: z.enum(["COD", "Online"]),
});


export function CheckoutForm() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to place an order." });
        setIsLoading(false);
        return;
    }
    
    if (cartItems.length === 0) {
      toast({ variant: "destructive", title: "Empty Cart", description: "Your cart is empty." });
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = checkoutSchema.safeParse(rawFormData);
  
    if (!validatedFields.success) {
      const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: errorMessages || "Please check your shipping details.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const newOrder = {
        userId: user.uid,
        customerName: validatedFields.data.name,
        address: validatedFields.data.address,
        items: cartItems.map(({ id, name, price, quantity, imageUrl }) => ({ id, name, price, quantity, imageUrl })),
        total: cartTotal,
        paymentMethod: validatedFields.data.paymentMethod,
        status: 'Pending' as const,
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, "orders"), newOrder);

      toast({
        title: "Order Placed!",
        description: `Your order has been successfully placed.`,
      });
      clearCart();
      formRef.current?.reset();
      router.push('/orders');

    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "An unexpected error occurred.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Main St, Anytown, USA" required />
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup defaultValue="COD" name="paymentMethod">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COD" id="cod" />
                <Label htmlFor="cod">Cash on Delivery (COD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Online" id="online" disabled />
                <Label htmlFor="online">Online Payment (Coming Soon)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Placing Order..." : "Place Order"}
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
