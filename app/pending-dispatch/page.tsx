"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DispatchConfirmModal } from "@/components/modals/dispatch-confirm-modal";
import { useAuth } from "@/components/auth/auth-provider";
import type { LostItem } from "@/lib/types";
import {
  Package,
  AlertTriangle,
  Clock,
  Truck,
  CalendarClock,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface PendingItem extends LostItem {
  dispatchDeadlineDate: Date;
  daysUntilDeadline: number;
  isOverdue: boolean;
}

export default function PendingDispatchPage() {
  const { user, permissions } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [isBulkDispatching, setIsBulkDispatching] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/items?status=stored&limit=200");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter items that are stored and within 3 days of dispatch deadline
  const pendingDispatchItems = useMemo(() => {
    const now = new Date();

    return items
      .filter((item) => {
        if (item.status !== "stored") return false;

        const dispatchDeadline = item.dispatchDeadline
          ? new Date(item.dispatchDeadline)
          : addDays(new Date(item.dateFound), item.dispatchDuration || 90);

        const daysUntilDeadline = differenceInDays(dispatchDeadline, now);
        return daysUntilDeadline <= 3;
      })
      .map((item): PendingItem => {
        const dispatchDeadlineDate = item.dispatchDeadline
          ? new Date(item.dispatchDeadline)
          : addDays(new Date(item.dateFound), item.dispatchDuration || 90);
        const daysUntilDeadline = differenceInDays(
          dispatchDeadlineDate,
          new Date(),
        );

        return {
          ...item,
          dispatchDeadlineDate,
          daysUntilDeadline,
          isOverdue: daysUntilDeadline < 0,
        };
      })
      .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
  }, [items]);

  const stats = useMemo(
    () => ({
      total: pendingDispatchItems.length,
      overdue: pendingDispatchItems.filter((i) => i.isOverdue).length,
      dueToday: pendingDispatchItems.filter((i) => i.daysUntilDeadline === 0)
        .length,
      dueSoon: pendingDispatchItems.filter(
        (i) => i.daysUntilDeadline > 0 && i.daysUntilDeadline <= 3,
      ).length,
    }),
    [pendingDispatchItems],
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(pendingDispatchItems.map((i) => i.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSingleDispatch = (item: LostItem) => {
    setSelectedItem(item);
    setDispatchModalOpen(true);
  };

  const handleBulkDispatch = async () => {
    if (selectedItems.size === 0) return;

    setIsBulkDispatching(true);

    try {
      const now = new Date().toISOString();
      const promises = Array.from(selectedItems).map((id) =>
        fetch(`/api/items/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "dispatched",
            dispatchedDate: now,
            dispatchedBy: user?.name || "Unknown",
          }),
        }),
      );

      await Promise.all(promises);
      setSelectedItems(new Set());
      loadData();
    } catch (error) {
      console.error("Error bulk dispatching:", error);
    } finally {
      setIsBulkDispatching(false);
    }
  };

  const handleModalSuccess = () => {
    loadData();
    setDispatchModalOpen(false);
    setSelectedItem(null);
  };

  const getUrgencyBadge = (daysUntilDeadline: number) => {
    if (daysUntilDeadline < 0) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {Math.abs(daysUntilDeadline)} days overdue
        </Badge>
      );
    }
    if (daysUntilDeadline === 0) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          Due Today
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        <Clock className="h-3 w-3 mr-1" />
        {daysUntilDeadline} days left
      </Badge>
    );
  };

  // if (!permissions?.canDispatch) {
  //   return (
  //     <AppShell title="Pending Dispatch">
  //       <div className="text-center py-12">
  //         <p className="text-muted-foreground">You do not have permission to access this page.</p>
  //       </div>
  //     </AppShell>
  //   )
  // }

  return (
    <AppShell title="Pending Dispatch">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.dueToday}
                </p>
                <p className="text-sm text-muted-foreground">Due Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.dueSoon}
                </p>
                <p className="text-sm text-muted-foreground">Due in 1-3 Days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Items Pending Dispatch</CardTitle>
                <CardDescription>
                  Items within 3 days of their dispatch deadline
                </CardDescription>
              </div>
              {selectedItems.size > 0 && (
                <Button
                  onClick={handleBulkDispatch}
                  disabled={isBulkDispatching}
                >
                  {isBulkDispatching && <Spinner className="h-4 w-4 mr-2" />}
                  <Truck className="h-4 w-4 mr-2" />
                  Dispatch Selected ({selectedItems.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : pendingDispatchItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No items pending dispatch
                </h3>
                <p className="text-sm text-muted-foreground">
                  All items are either not due for dispatch yet or have already
                  been processed.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedItems.size ===
                              pendingDispatchItems.length &&
                            pendingDispatchItems.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Store Location</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDispatchItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "hover:bg-muted/30",
                          item.isOverdue && "bg-red-50 hover:bg-red-100/50",
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(item.id, checked as boolean)
                            }
                            aria-label={`Select ${item.code}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          {item.code}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.itemDescription}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.storeLocation}</TableCell>
                        <TableCell>
                          {format(item.dispatchDeadlineDate, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {getUrgencyBadge(item.daysUntilDeadline)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleSingleDispatch(item)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Dispatch
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Modal */}
      <DispatchConfirmModal
        item={selectedItem}
        open={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </AppShell>
  );
}
