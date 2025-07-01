
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDeliverySettings, updateDeliverySettings, getPromoCodes, createPromoCode, deletePromoCode } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliverySettings, PromoCode } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
  fee: z.coerce.number().min(0, "Delivery fee must be a positive number."),
  freeDeliveryThreshold: z.coerce.number().min(0, "Threshold must be a positive number."),
});

const promoCodeSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters.").toUpperCase(),
    discountPercentage: z.coerce.number().min(1, "Discount must be at least 1%.").max(100, "Discount cannot exceed 100%.")
})

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoadingPromo, setIsLoadingPromo] = useState(true);

  const deliveryForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { fee: 0, freeDeliveryThreshold: 0 },
  });

  const promoForm = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { code: "", discountPercentage: 10 },
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    const settings = await getDeliverySettings();
    deliveryForm.reset({ 
      fee: settings.fee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold
    });
    setIsLoading(false);
  };
  
  const fetchPromoCodes = async () => {
      setIsLoadingPromo(true);
      const codes = await getPromoCodes();
      setPromoCodes(codes);
      setIsLoadingPromo(false);
  }

  useEffect(() => {
    fetchSettings();
    fetchPromoCodes();
  }, []);

  const onDeliverySubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await updateDeliverySettings(values);
      toast({ title: "Settings Updated", description: "Delivery settings have been successfully updated." });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update the settings." });
    }
  };

  const onPromoSubmit = async (values: z.infer<typeof promoCodeSchema>) => {
    try {
        await createPromoCode({ id: values.code, discountPercentage: values.discountPercentage });
        toast({ title: "Promo Code Created", description: `Code "${values.code}" has been created.` });
        promoForm.reset();
        fetchPromoCodes();
    } catch (error) {
        console.error("Error creating promo code:", error);
        toast({ variant: "destructive", title: "Creation Failed", description: "Could not create the promo code. It might already exist." });
    }
  }

  const handleDeletePromo = async (codeId: string) => {
    try {
        await deletePromoCode(codeId);
        toast({ title: "Promo Code Deleted" });
        fetchPromoCodes();
    } catch (error) {
        console.error("Error deleting promo code:", error);
        toast({ variant: "destructive", title: "Deletion Failed" });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store Settings</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>Manage delivery fees and promotions for your store.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" /> <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ) : (
                <Form {...deliveryForm}>
                  <form onSubmit={deliveryForm.handleSubmit(onDeliverySubmit)} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <FormField control={deliveryForm.control} name="fee" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Delivery Fee (Rs)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={deliveryForm.control} name="freeDeliveryThreshold" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Delivery Threshold (Rs)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormDescription>Minimum order total for free delivery. Set to 0 to disable.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={deliveryForm.formState.isSubmitting}>
                      {deliveryForm.formState.isSubmitting ? "Saving..." : "Save Delivery Settings"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Promo Codes</CardTitle>
                    <CardDescription>Create and manage discount codes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...promoForm}>
                        <form onSubmit={promoForm.handleSubmit(onPromoSubmit)} className="flex items-end gap-2">
                            <FormField control={promoForm.control} name="code" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>New Code</FormLabel>
                                    <FormControl><Input placeholder="SUMMER20" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={promoForm.control} name="discountPercentage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount (%)</FormLabel>
                                    <FormControl><Input type="number" className="w-24" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={promoForm.formState.isSubmitting}>Add</Button>
                        </form>
                    </Form>
                    <Separator className="my-6"/>
                    <h3 className="text-sm font-medium mb-2">Active Codes</h3>
                    {isLoadingPromo ? <Skeleton className="h-20 w-full"/> : (
                        <div className="space-y-2">
                            {promoCodes.length > 0 ? promoCodes.map(pc => (
                                <div key={pc.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <Badge variant="outline" className="text-base">{pc.id}</Badge>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{pc.discountPercentage}% OFF</span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete "{pc.id}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePromo(pc.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">No promo codes created yet.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
