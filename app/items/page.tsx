"use client";

import { useState, useCallback, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ViewDetailsModal } from "@/components/modals/view-details-modal";
import { AddItemModal } from "@/components/modals/add-item-modal";
import { EditItemModal } from "@/components/modals/edit-item-modal";
import { HandoverModal } from "@/components/modals/handover-modal";
import { DispatchConfirmModal } from "@/components/modals/dispatch-confirm-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/components/auth/auth-provider";
import type { LostItem, HotelSettings } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  HandHeart,
  Truck,
  Printer,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const statusStyles: Record<string, string> = {
  stored: "bg-primary/10 text-primary border-primary/20",
  handed_over: "bg-green-100 text-green-700 border-green-200",
  dispatched: "bg-secondary/10 text-secondary border-secondary/20",
};

export default function ItemsPage() {
  const { permissions } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Modal states
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      if (search) params.append("search", search);
      if (status && status !== "all") params.append("status", status);
      if (month) params.append("month", month);
      if (year) params.append("year", year);

      const res = await fetch(`/api/items?${params}`);
      const data = await res.json();

      setItems(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Fetch settings
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, status, month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, month, year]);

  const hasActiveFilters = search || status !== "all" || month || year;

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setMonth("");
    setYear("");
  };

  // Handlers
  const handleView = (item: LostItem) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  const handleEdit = (item: LostItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: LostItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleHandover = (item: LostItem) => {
    setSelectedItem(item);
    setHandoverModalOpen(true);
  };

  const handleDispatch = (item: LostItem) => {
    setSelectedItem(item);
    setDispatchModalOpen(true);
  };

  const handlePrint = async (item: LostItem) => {
    if (!settings) return;
    const { generateItemPDF, generateHandoverPDF } =
      await import("@/lib/pdf-generator.client");
    if (item.status === "handed_over") {
      await generateHandoverPDF(item, settings);
    } else {
      await generateItemPDF(item, settings);
    }
  };

  const handleModalSuccess = () => {
    loadData();
    setViewModalOpen(false);
    setAddModalOpen(false);
    setEditModalOpen(false);
    setHandoverModalOpen(false);
    setDispatchModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/export");
    exportToExcel(items);
  };

  const handleExportCSV = async () => {
    const { exportToCSV } = await import("@/lib/export");
    exportToCSV(items);
  };

  return (
    <AppShell title="Lost & Found Items">
      <div className="space-y-4">
        {/* Header with Add button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {totalItems} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
            {permissions?.canAdd && (
              <Button
                onClick={() => setAddModalOpen(true)}
                size="sm"
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            )}
          </div>
        </div>

        {/* Filters - All in one line */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, description, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="stored">Stored</SelectItem>
              <SelectItem value="handed_over">Handed Over</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
            </SelectContent>
          </Select>

          {/* Month */}
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="cursor-pointer"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            No items found.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#403A60] hover:text-[#403A60] hover:bg-[#403A60]">
                  <TableHead className="font-semibold text-amber-100">
                    Serial
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100">
                    Code
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100">
                    Date Found
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100">
                    Location Found
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100">
                    Item Name
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100">
                    Store
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-amber-100 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>
                      {format(new Date(item.dateFound), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{item.locationFound || item.location}</TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {item.itemDescription}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
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
                          onClick={() => handleView(item)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {permissions?.canEdit && item.status === "stored" && (
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {permissions?.canHandover &&
                          item.status === "stored" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleHandover(item)}
                              title="Handover"
                              className="text-green-600 cursor-pointer"
                            >
                              <HandHeart className="h-4 w-4" />
                            </Button>
                          )}
                        {permissions?.canDispatch &&
                          item.status === "stored" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDispatch(item)}
                              title="Dispatch"
                              className="text-secondary  cursor-pointer"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                        <Button
                          className="cursor-pointer"
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(item)}
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {permissions?.canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            className="text-destructive  cursor-pointer"
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ViewDetailsModal
        item={selectedItem}
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />
      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <EditItemModal
        item={selectedItem}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <HandoverModal
        item={selectedItem}
        open={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <DispatchConfirmModal
        item={selectedItem}
        open={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <DeleteConfirmModal
        item={selectedItem}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </AppShell>
  );
}
