"use client";

import { useFormStatus } from "react-dom";
import { placeOrder } from "@/lib/actions";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Placing Order..." : "Place Order"}
    </Button>
  );
}

export function CheckoutForm() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const handlePlaceOrder = async (formData: FormData) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to place an order." });
        return;
    }
    
    const result = await placeOrder(cartItems, cartTotal, user.uid, formData);
    
    if (result.success) {
      toast({
        title: "Order Placed!",
        description: `Your order has been successfully placed.`,
      });
      clearCart();
      formRef.current?.reset();
      router.push('/orders');
    } else {
      const errorMessages = Object.values(result.errors || {}).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: errorMessages || "An unexpected error occurred.",
      });
    }
  };

  return (
    <form ref={formRef} action={handlePlaceOrder}>
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
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
