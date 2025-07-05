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
            <TableHead>Delivery Person</TableHead>
            <TableHead>Delivered At</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-center">Amount Submitted</TableHead>
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
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No delivered orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
