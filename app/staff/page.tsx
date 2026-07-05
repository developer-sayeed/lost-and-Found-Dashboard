"use client";

import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddUserModal } from "@/components/modals/add-user-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { useAuth } from "@/components/auth/auth-provider";
import { ROLE_LABELS } from "@/lib/constants";
import type { User } from "@/lib/types";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  Users,
  Shield,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export default function StaffPage() {
  const { user: currentUser, permissions } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.role === "super_admin";

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter(
      (u) =>
        u.role === "super_admin" ||
        u.role === "supervisor" ||
        u.role === "manager",
    ).length,
    employees: users.filter((u) => u.role === "employee").length,
  };

  const handleEdit = (user: User) => {
    // Only super admin can edit
    if (!isSuperAdmin) return;
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    // Only super admin can toggle status
    if (!isSuperAdmin) return;
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !selectedUser.isActive }),
      });
      await loadData();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setIsUpdating(false);
      setToggleStatusDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDelete = (user: User) => {
    // Only super admin can delete
    if (!isSuperAdmin) return;
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsUpdating(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleModalSuccess = () => {
    loadData();
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <ShieldCheck className="h-4 w-4" />;
      case "supervisor":
        return <Shield className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "supervisor":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "manager":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // if (!permissions?.canManageUsers) {
  //   return (
  //     <AppShell title="Staff Management">
  //       <div className="text-center py-12">
  //         <p className="text-muted-foreground">
  //           You do not have permission to access this page.
  //         </p>
  //       </div>
  //     </AppShell>
  //   );
  // }

  return (
    <AppShell title="Staff Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Manager</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.employees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  Manage your team members and their permissions
                </CardDescription>
              </div>
              {/* Only super admin can add staff members */}
              {isSuperAdmin && (
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#403A60] hover:text-[#403A60] hover:bg-[#403A60]">
                      <TableHead className=" text-amber-100">Serial</TableHead>
                      <TableHead className=" text-amber-100">Name</TableHead>
                      <TableHead className=" text-amber-100">User ID</TableHead>
                      <TableHead className=" text-amber-100">Phone</TableHead>
                      <TableHead className=" text-amber-100">
                        Department
                      </TableHead>

                      {/* Role column - only visible to super admin */}
                      {isSuperAdmin && <TableHead>Role</TableHead>}

                      {/* Status column - only visible to super admin */}
                      {isSuperAdmin && <TableHead>Status</TableHead>}

                      {/* Actions column - only visible to super admin */}
                      {isSuperAdmin && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => {
                      const isCurrentUser = user.id === currentUser?.id;
                      const isUserSuperAdmin = user.role === "super_admin";

                      return (
                        <TableRow key={user.id} className="hover:bg-muted/30">
                          <TableCell className="pl-4">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.department || "-"}</TableCell>
                          {isSuperAdmin && (
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex items-center gap-1 w-fit",
                                  getRoleBadgeStyle(user.role),
                                )}
                              >
                                {getRoleIcon(user.role)}
                                {ROLE_LABELS[user.role]}
                              </Badge>
                            </TableCell>
                          )}
                          {/* Status column - only visible to super admin */}
                          {isSuperAdmin && (
                            <TableCell>
                              <Badge
                                className={
                                  user.isActive
                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                    : "bg-red-100 text-red-700 hover:bg-red-100"
                                }
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          )}

                          {/* Actions column - only visible to super admin */}
                          {isSuperAdmin && (
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(user)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>

                                  {!isCurrentUser && (
                                    <DropdownMenuItem
                                      onClick={() => handleToggleStatus(user)}
                                    >
                                      {user.isActive ? (
                                        <>
                                          <UserX className="h-4 w-4 mr-2" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  )}

                                  {!isCurrentUser && !isUserSuperAdmin && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(user)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals - Only accessible to super admin */}
      {isSuperAdmin && (
        <>
          <AddUserModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
          <EditUserModal
            user={selectedUser}
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleModalSuccess}
          />

          {/* Toggle Status Dialog */}
          <AlertDialog
            open={toggleStatusDialogOpen}
            onOpenChange={setToggleStatusDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {selectedUser?.isActive ? "Deactivate" : "Activate"} User
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedUser?.isActive
                    ? `Are you sure you want to deactivate ${selectedUser?.name}? They will no longer be able to log in.`
                    : `Are you sure you want to activate ${selectedUser?.name}? They will be able to log in again.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmToggleStatus}
                  disabled={isUpdating}
                >
                  {isUpdating && <Spinner className="h-4 w-4 mr-2" />}
                  {selectedUser?.isActive ? "Deactivate" : "Activate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Dialog */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedUser?.name}? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  disabled={isUpdating}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isUpdating && <Spinner className="h-4 w-4 mr-2" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </AppShell>
  );
}
