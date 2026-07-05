"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2, HandHeart, Truck, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LostItem } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";

interface RecentItemsTableProps {
  items: LostItem[];
  onView: (item: LostItem) => void;
  onEdit: (item: LostItem) => void;
  onDelete: (item: LostItem) => void;
  onHandover: (item: LostItem) => void;
  onDispatch: (item: LostItem) => void;
  onPrint: (item: LostItem) => void;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canHandover: boolean;
    canDispatch: boolean;
  };
}

const statusStyles: Record<string, string> = {
  stored: "bg-primary/10 text-primary border-primary/20",
  handed_over: "bg-green-100 text-green-700 border-green-200",
  dispatched: "bg-secondary/10 text-secondary border-secondary/20",
};

export function RecentItemsTable({
  items,
  onView,
  onEdit,
  onDelete,
  onHandover,
  onDispatch,
  onPrint,
  permissions,
}: RecentItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No items found.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#403A60] hover:text-[#403A60] hover:bg-[#403A60]">
            <TableHead className="font-semibold text-amber-50 ">Code</TableHead>
            <TableHead className="font-semibold text-amber-50">
              Date Found
            </TableHead>
            <TableHead className="font-semibold text-amber-50">
              Location
            </TableHead>
            <TableHead className="font-semibold text-amber-50">
              Description
            </TableHead>
            <TableHead className="font-semibold text-amber-50">
              Store Location
            </TableHead>
            <TableHead className="font-semibold text-amber-50">
              Status
            </TableHead>
            <TableHead className="font-semibold text-amber-50 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.slice(0, 5).map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell>
                {format(new Date(item.dateFound), "dd MMM yyyy")}
              </TableCell>
              <TableCell>{item.locationFound || item.location}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {item.itemDescription}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {item.storeLocation}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(statusStyles[item.status])}
                >
                  {STATUS_LABELS[item.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(item)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {permissions.canEdit && item.status === "stored" && (
                    <Button
                      className="cursor-pointer"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {permissions.canHandover && item.status === "stored" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onHandover(item)}
                      title="Handover"
                      className="text-green-600 cursor-pointer"
                    >
                      <HandHeart className="h-4 w-4" />
                    </Button>
                  )}
                  {permissions.canDispatch && item.status === "stored" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDispatch(item)}
                      title="Dispatch"
                      className="text-secondary cursor-pointer"
                    >
                      <Truck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => onPrint(item)}
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  {permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      title="Delete"
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
