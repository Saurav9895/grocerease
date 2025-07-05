"use client";

import { useEffect, useState } from "react";
import { DeliveriesTable } from "@/components/admin/DeliveriesTable";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDeliveriesPage() {
  const { user } = useAuth();
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const orders = await getDeliveredOrders();
    setDeliveredOrders(orders);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Log</h1>
        <p className="text-muted-foreground">A chronological log of all completed deliveries.</p>
      </div>
      
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
        <DeliveriesTable orders={deliveredOrders} />
      )}
    </div>
  );
}
