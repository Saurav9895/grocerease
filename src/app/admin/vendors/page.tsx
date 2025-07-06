
"use client";

import { useEffect, useState } from "react";
import { getVendors, getProducts, getAdminUsers } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Vendor, Product, UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorsTable, type VendorWithProductCount } from "@/components/admin/VendorsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AdminVendorsPage() {
  const { profile } = useAuth();
  const [vendorsWithCount, setVendorsWithCount] = useState<VendorWithProductCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile && (profile.adminRole === 'main' || profile.adminRole === 'standard')) {
      const fetchData = async () => {
        setIsLoading(true);

        const [vendors, products, users] = await Promise.all([
          getVendors(),
          getProducts(),
          getAdminUsers(),
        ]);

        const productCountByVendor = products.reduce((acc, product) => {
          if (product.vendorId) {
            acc[product.vendorId] = (acc[product.vendorId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const userMap = new Map(users.map(u => [u.id, u]));

        const combinedData: VendorWithProductCount[] = vendors.map(vendor => ({
          ...vendor,
          productCount: productCountByVendor[vendor.id] || 0,
          ownerEmail: userMap.get(vendor.ownerId)?.email || 'N/A',
        }));

        setVendorsWithCount(combinedData);
        setIsLoading(false);
      };
      fetchData();
    } else if (profile) {
      setIsLoading(false);
    }
  }, [profile]);
  
  if (profile?.adminRole !== 'main' && profile?.adminRole !== 'standard') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="text-destructive" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Vendors</h1>
      {isLoading ? (
        <div className="border rounded-md">
            <div className="p-4"><Skeleton className="h-8 w-1/4" /></div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      ) : (
        <VendorsTable vendors={vendorsWithCount} />
      )}
    </div>
  );
}
