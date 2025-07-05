
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { markPaymentAsSubmitted } from "@/lib/data";

interface DeliveriesTableProps {
  orders: Order[];
  onDataChanged: () => void;
}

export function DeliveriesTable({ orders, onDataChanged }: DeliveriesTableProps) {
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleMarkAsSubmitted = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      await markPaymentAsSubmitted(orderId);
      toast({
        title: "Payment Submitted",
        description: "The payment for this order has been marked as submitted.",
      });
      onDataChanged();
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not mark the payment as submitted.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="border rounded-md bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Delivery Person</TableHead>
            <TableHead>Delivered At</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-center">Submission Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                   <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                    {order.id.substring(0, 7)}...
                  </Link>
                </TableCell>
                <TableCell>{order.deliveryPersonName || 'N/A'}</TableCell>
                <TableCell>{order.deliveredAt ? format(order.deliveredAt, 'PPp') : 'N/A'}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>Rs{order.total.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  {order.paymentSubmitted ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submitted
                    </Badge>
                  ) : (
                     <Badge variant="secondary">
                        <CircleDashed className="mr-2 h-4 w-4" />
                        Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {order.paymentMethod === 'COD' && !order.paymentSubmitted && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleMarkAsSubmitted(order.id)}
                      disabled={updatingOrderId === order.id}
                    >
                      {updatingOrderId === order.id ? 'Submitting...' : 'Mark as Submitted'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No delivered orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
