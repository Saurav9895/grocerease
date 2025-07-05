"use client";

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

interface DeliveriesTableProps {
  orders: Order[];
}

export function DeliveriesTable({ orders }: DeliveriesTableProps) {
  return (
    <div className="border rounded-md bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Delivered At</TableHead>
            <TableHead>Delivery Person</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
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
                <TableCell>{order.deliveredAt ? format(order.deliveredAt, 'PPp') : 'N/A'}</TableCell>
                <TableCell>{order.deliveryPersonName || 'N/A'}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                   <Badge variant="outline">{order.paymentMethod}</Badge>
                </TableCell>
                <TableCell>
                    {order.paymentSubmitted ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Submitted
                        </Badge>
                    ) : (
                         <Badge variant="secondary">
                            <CircleDashed className="mr-1 h-3 w-3" /> Pending
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">Rs{order.total.toFixed(2)}</TableCell>
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
