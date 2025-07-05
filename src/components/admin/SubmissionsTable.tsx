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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { Order, GroupedDeliveries } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle2, CircleDashed, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { markPaymentAsSubmitted } from "@/lib/data";

interface SubmissionsTableProps {
  groupedDeliveries: GroupedDeliveries;
  onDataChanged: () => void;
}

export function SubmissionsTable({ groupedDeliveries, onDataChanged }: SubmissionsTableProps) {
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

  const deliveryPersonIds = Object.keys(groupedDeliveries);

  if (deliveryPersonIds.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
        <p>No pending cash-on-delivery submissions found.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {deliveryPersonIds.map((personId) => {
        const { personName, orders } = groupedDeliveries[personId];
        const pendingSubmissions = orders.filter(o => !o.paymentSubmitted).length;
        
        if (orders.length === 0) return null;

        return (
          <AccordionItem value={personId} key={personId} className="border rounded-lg bg-card overflow-hidden">
            <AccordionTrigger className="px-6 py-4 text-lg hover:no-underline">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-muted rounded-full">
                    <Truck className="h-6 w-6 text-muted-foreground" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-left">{personName}</h3>
                    <p className="text-sm text-muted-foreground text-left">
                        {orders.length} COD deliver{orders.length === 1 ? 'y' : 'ies'}
                        {pendingSubmissions > 0 && `, ${pendingSubmissions} pending submission(s)`}
                    </p>
                 </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Delivered At</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submission Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                          {order.id.substring(0, 7)}...
                        </Link>
                      </TableCell>
                      <TableCell>{order.deliveredAt ? format(order.deliveredAt, 'PPp') : 'N/A'}</TableCell>
                      <TableCell>Rs{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {order.paymentSubmitted ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Submitted
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <CircleDashed className="mr-2 h-4 w-4" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!order.paymentSubmitted && (
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
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
