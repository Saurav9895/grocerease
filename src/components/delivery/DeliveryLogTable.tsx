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
import { Button } from "../ui/button";
import { Eye, CheckCircle2, CircleDashed } from "lucide-react";

interface DeliveryLogTableProps {
  orders: Order[];
}

export function DeliveryLogTable({ orders }: DeliveryLogTableProps) {
  return (
    <div className="border rounded-md bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Delivered At</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Submission</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                   <Link href={`/delivery/orders/${order.id}`} className="hover:underline text-primary">
                    {order.id.substring(0, 7)}...
                  </Link>
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.deliveredAt ? format(order.deliveredAt, 'PPp') : 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{order.paymentMethod}</Badge> Rs{order.total.toFixed(2)}
                </TableCell>
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
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/delivery/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No deliveries found for the selected date.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
