"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "@/components/admin/OrderTable";
import { getOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setIsLoading(true);
        const allOrders = await getOrders();
        setOrders(allOrders);
        setIsLoading(false);
      };
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Orders</h1>
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
        <OrderTable orders={orders} />
      )}
    </div>
  );
}
