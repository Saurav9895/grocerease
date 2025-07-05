"use client";

import { useEffect, useState, useMemo } from "react";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryLogTable } from "@/components/delivery/DeliveryLogTable";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { startOfDay, endOfDay } from 'date-fns';

export default function DeliveryLogPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setIsLoading(true);
        const deliveredOrders = await getDeliveredOrders({ deliveryPersonId: user.uid });
        setOrders(deliveredOrders);
        setIsLoading(false);
      };
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (!selectedDate) {
      return orders;
    }
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    return orders.filter(order => {
        if (!order.deliveredAt) return false;
        const deliveredDate = new Date(order.deliveredAt);
        return deliveredDate >= start && deliveredDate <= end;
    });
  }, [orders, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Delivery History</h1>
          <p className="text-muted-foreground">A log of your completed deliveries.</p>
        </div>
        <div className="flex items-center gap-2">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            {selectedDate && <Button variant="ghost" onClick={() => setSelectedDate(undefined)}>Clear</Button>}
        </div>
      </div>
      {isLoading ? (
        <div className="border rounded-md">
            <div className="p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      ) : (
        <DeliveryLogTable orders={filteredOrders} />
      )}
    </div>
  );
}
