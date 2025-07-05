"use client";

import { useEffect, useState } from "react";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order, GroupedDeliveries } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSubmissionsPage() {
  const { user } = useAuth();
  const [groupedOrders, setGroupedOrders] = useState<GroupedDeliveries>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndGroupOrders = async () => {
    setIsLoading(true);
    const deliveredOrders = await getDeliveredOrders();
    
    const groups: GroupedDeliveries = {};
    for (const order of deliveredOrders) {
      // Only include COD orders for submission tracking
      if (order.paymentMethod === 'COD') {
          const personId = order.deliveryPersonId || 'unassigned';
          const personName = order.deliveryPersonName || 'Unassigned';

          if (!groups[personId]) {
            groups[personId] = {
              personName,
              orders: [],
            };
          }
          groups[personId].orders.push(order);
      }
    }

    setGroupedOrders(groups);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAndGroupOrders();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cash Submissions</h1>
        <p className="text-muted-foreground">Review and confirm cash-on-delivery submissions from delivery staff.</p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <SubmissionsTable groupedDeliveries={groupedOrders} onDataChanged={fetchAndGroupOrders} />
      )}
    </div>
  );
}
