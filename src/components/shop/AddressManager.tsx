
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getUserAddresses, deleteUserAddress } from "@/lib/data";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AddressForm } from "./AddressForm";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Home, Pencil, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddressManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    if (user) {
      setIsLoading(true);
      const userAddresses = await getUserAddresses(user.uid);
      setAddresses(userAddresses);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAddress(null);
    fetchAddresses();
  };

  const handleOpenForm = (address: Address | null) => {
    setSelectedAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;
    try {
      await deleteUserAddress(user.uid, addressId);
      toast({ title: "Address deleted successfully" });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({ variant: "destructive", title: "Failed to delete address" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Shipping Addresses</CardTitle>
            <CardDescription>Manage your saved addresses.</CardDescription>
        </div>
        <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between p-4 rounded-lg border">
              <div className="flex items-start gap-4">
                <Home className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">{address.name}</p>
                  <p className="text-muted-foreground">{address.apartment}, {address.street}, {address.city}, {address.state} {address.zip}</p>
                  <p className="text-muted-foreground">{address.country}</p>
                  <p className="text-muted-foreground">Phone: {address.phone}</p>
                   {address.googleMapsUrl && (
                    <a href={address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      View on Map
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(address)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this address.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(address.id!)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">You have no saved addresses.</p>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setSelectedAddress(null);
      }}>
        <DialogContent 
            className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{selectedAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <AddressForm address={selectedAddress} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
