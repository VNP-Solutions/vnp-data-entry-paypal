"use client";

import { useState } from "react";
import { Loader2, Search, MoreHorizontal, UserPlus, Users, RotateCcw, Filter, CheckCircle2, ShieldAlert, Trash2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUsers, useUpdateUserStatus, useDeleteUser } from "@/lib/hooks/use-api";
import { format } from "date-fns";
import { InviteUserDialog } from "@/components/shared/invite-user-dialog";
import { MasterPasswordDialog } from "@/components/shared/master-password-dialog";
import { toast } from "sonner";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "status" | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, isLoading, refetch } = useUsers({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);
  };

  const promptMasterPassword = (user: any, action: "delete" | "status") => {
    setSelectedUser(user);
    setActionType(action);
    setShowMasterPasswordModal(true);
  };

  const executeProtectedAction = async (masterPassword: string) => {
    if (!selectedUser || !actionType) return;

    try {
      if (actionType === "status") {
        await updateUserStatusMutation.mutateAsync({
          id: selectedUser.id,
          data: {
            isActive: !selectedUser.isActive,
            masterPassword,
          }
        });
      } else if (actionType === "delete") {
        await deleteUserMutation.mutateAsync({
          id: selectedUser.id,
          data: { masterPassword }
        });
      }
    } catch (error: any) {
        // Validation errors happen here if master pw fails
        toast.error(error.response?.data?.message || "Failed to execute protected action");
        throw error; // keep modal open to retry
    }
  };

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500">Manage platform users, invitations, and access controls</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-10 w-full"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Account Status</label>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 bg-white">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending Invite</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-5 flex items-center justify-end gap-2 h-10">
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-full border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              >
                <RotateCcw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Reset</span>
              </Button>
              <Button onClick={handleSearch} className="h-full bg-slate-800 hover:bg-slate-900">
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border border-gray-100 overflow-hidden bg-white">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Name / Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden md:table-cell">Invited By</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Last Login</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <p>Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                        <p>No users found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{user.name || "-"}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.statusColor === 'green'
                                ? 'bg-green-50 text-green-700 border border-green-200/50'
                                : user.statusColor === 'orange'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                : 'bg-slate-100 text-slate-700 border border-slate-200/50'
                            }`}
                          >
                            {user.statusColor === 'green' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {user.statusColor === 'orange' && <Clock className="w-3 h-3 mr-1" />}
                            {user.status === 'deactivated' && <ShieldAlert className="w-3 h-3 mr-1 text-red-500" />}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-600">
                          {user.invitedBy}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-gray-600">
                          {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy HH:mm") : "Never"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.email)}
                              >
                                Copy Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => promptMasterPassword(user, "status")}
                                className={user.isActive ? "text-orange-600 focus:text-orange-700 focus:bg-orange-50" : "text-green-600 focus:text-green-700 focus:bg-green-50"}
                              >
                                {user.isActive ? "Deactivate Account" : "Activate Account"}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => promptMasterPassword(user, "delete")}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              >
                                Permanently Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50">
                <div className="text-sm text-gray-500">
                  Page <span className="font-medium text-gray-900">{page}</span> of{" "}
                  <span className="font-medium text-gray-900">{pagination.pages}</span> ({pagination.total} users)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Modals */}
      <InviteUserDialog 
        open={showInviteModal} 
        onOpenChange={setShowInviteModal} 
      />
      
      <MasterPasswordDialog
        open={showMasterPasswordModal}
        onOpenChange={setShowMasterPasswordModal}
        title={actionType === "delete" ? "Delete User" : `${selectedUser?.isActive ? 'Deactivate' : 'Activate'} User`}
        description={
            actionType === "delete" 
            ? `You are about to permanently delete ${selectedUser?.email}. This action cannot be undone and requires the MASTER PASSWORD.`
            : `Enter the MASTER PASSWORD to ${selectedUser?.isActive ? 'deactivate' : 'activate'} the account for ${selectedUser?.email}.`
        }
        isDestructive={actionType === "delete" || (actionType === "status" && selectedUser?.isActive)}
        actionButtonLabel="Confirm Action"
        onSubmit={executeProtectedAction}
      />
    </div>
  );
}
