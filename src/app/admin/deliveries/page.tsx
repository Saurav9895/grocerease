"use client";

import { useEffect, useState } from "react";
import { DeliveriesTable } from "@/components/admin/DeliveriesTable";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDeliveriesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setIsLoading(true);
        const deliveredOrders = await getDeliveredOrders();
        setOrders(deliveredOrders);
        setIsLoading(false);
      };
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Log</h1>
        <p className="text-muted-foreground">A log of all completed deliveries and their payment status.</p>
      </div>
      
      {isLoading ? (
        <div className="border rounded-md">
            <div className="p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      ) : (
        <DeliveriesTable orders={orders} />
      )}
    </div>
  );
}
