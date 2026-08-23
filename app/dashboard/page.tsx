"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentItemsTable } from "@/components/dashboard/recent-items-table";
import { ViewDetailsModal } from "@/components/modals/view-details-modal";
import { AddItemModal } from "@/components/modals/add-item-modal";
import { EditItemModal } from "@/components/modals/edit-item-modal";
import { HandoverModal } from "@/components/modals/handover-modal";
import { DispatchConfirmModal } from "@/components/modals/dispatch-confirm-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import type { LostItem, HotelSettings } from "@/lib/types";
import {
  Package,
  Clock,
  HandHeart,
  Truck,
  Plus,
  ArrowRight,
} from "lucide-react";

interface StatsData {
  total: number;
  stored: number;
  handedOver: number;
  dispatched: number;
  pendingDispatch: number;
  statusData: { name: string; value: number; status: string }[];
  categoryData: { name: string; value: number }[];
}

export default function DashboardPage() {
  const { permissions } = useAuth();
  const [recentItems, setRecentItems] = useState<LostItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch stats
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent 10 items
      const itemsRes = await fetch("/api/items?recent=true");
      const itemsData = await itemsRes.json();
      setRecentItems(itemsData.items || []);

      // Fetch settings
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            title="Total Items"
            value={stats?.total || 0}
            icon={Package}
            variant="primary"
          />
          <StatsCard
            title="Stored"
            value={stats?.stored || 0}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Handed Over"
            value={stats?.handedOver || 0}
            icon={HandHeart}
            variant="success"
          />
          <StatsCard
            title="Dispatched"
            value={stats?.dispatched || 0}
            icon={Truck}
            variant="info"
          />
        </div>

        {/* Charts */}      
        {stats && stats.statusData.length > 0 && (
          <DashboardCharts
            statusData={stats.statusData}
            categoryData={stats.categoryData}
          />
        )}

        {/* Recent Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Recent Items
            </CardTitle>
            <div className="flex items-center gap-2">
              {permissions?.canAdd && (
                <Button
                  onClick={() => setAddModalOpen(true)}
                  size="sm"
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2 " />
                  Add New Item
                </Button>
              )}
              <Link href="/items">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 " />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RecentItemsTable
              items={recentItems}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onHandover={handleHandover}
              onDispatch={handleDispatch}
              onPrint={handlePrint}
              permissions={{
                canEdit: permissions?.canEdit || false,
                canDelete: permissions?.canDelete || false,
                canHandover: permissions?.canHandover || false,
                canDispatch: permissions?.canDispatch || false,
              }}
            />
          </CardContent>
        </Card>
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
