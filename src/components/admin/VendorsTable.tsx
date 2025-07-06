
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Vendor } from "@/lib/types";
import { format } from "date-fns";

export interface VendorWithProductCount extends Vendor {
    productCount: number;
    ownerEmail: string;
}

interface VendorsTableProps {
  vendors: VendorWithProductCount[];
}

export function VendorsTable({ vendors }: VendorsTableProps) {
  return (
    <div className="border rounded-md bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Owner Email</TableHead>
            <TableHead className="text-center">Products</TableHead>
            <TableHead>Joined On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>{vendor.ownerEmail}</TableCell>
                <TableCell className="text-center">{vendor.productCount}</TableCell>
                <TableCell>{format(vendor.createdAt, 'PP')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No vendors found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
