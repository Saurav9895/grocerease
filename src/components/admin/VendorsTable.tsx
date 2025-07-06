
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
import { MapPin } from "lucide-react";
import Link from "next/link";

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
            <TableHead>Location</TableHead>
            <TableHead className="text-center">Products</TableHead>
            <TableHead>Joined On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">
                  <Link href={`/vendor/${vendor.id}`} className="hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                    {vendor.name}
                  </Link>
                </TableCell>
                <TableCell>{vendor.ownerEmail}</TableCell>
                <TableCell>
                  {vendor.address && (vendor.address.street || vendor.address.city) ? (
                    <div className="text-sm">
                        <p className="font-medium">{vendor.address.apartment && `${vendor.address.apartment}, `}{vendor.address.street}</p>
                        <p className="text-muted-foreground">{vendor.address.city}, {vendor.address.state} {vendor.address.zip}</p>
                      {vendor.address.googleMapsUrl && (
                        <a 
                          href={vendor.address.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline text-xs flex items-center gap-1 mt-1"
                        >
                          <MapPin className="h-3 w-3" />
                          View on Map
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Not set</span>
                  )}
                </TableCell>
                <TableCell className="text-center">{vendor.productCount}</TableCell>
                <TableCell>{format(vendor.createdAt, 'PP')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                No vendors found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
