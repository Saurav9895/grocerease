"use client";

import { useEffect, useState, useMemo } from "react";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryLogTable } from "@/components/delivery/DeliveryLogTable";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from "react-day-picker";

export default function DeliveryLogPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>(undefined);

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
    if (!date?.from) {
      return orders;
    }
    const start = startOfDay(date.from);
    const end = date.to ? endOfDay(date.to) : endOfDay(date.from);
    return orders.filter(order => {
        if (!order.deliveredAt) return false;
        const deliveredDate = new Date(order.deliveredAt);
        return deliveredDate >= start && deliveredDate <= end;
    });
  }, [orders, date]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Delivery History</h1>
            <p className="text-muted-foreground">A log of your completed deliveries.</p>
          </div>
          <div className="flex items-center gap-2">
              <DateRangePicker date={date} onDateChange={setDate} />
              {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 overflow-y-auto mt-6">
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
    </div>
  );
}
