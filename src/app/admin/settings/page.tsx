
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDeliverySettings, updateDeliverySettings } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliverySettings } from "@/lib/types";

const settingsSchema = z.object({
  fee: z.coerce.number().min(0, "Delivery fee must be a positive number."),
});

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fee: 0,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const settings = await getDeliverySettings();
      form.reset({ fee: settings.fee });
      setIsLoading(false);
    };
    fetchSettings();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await updateDeliverySettings(values);
      toast({
        title: "Settings Updated",
        description: "Delivery fee has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the settings.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>
            Set the delivery fee for all orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-10 w-20" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem className="max-w-sm">
                      <FormLabel>Delivery Fee ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
