"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Key,
  Download,
  Loader2,
  Pencil,
  Trash2,
  RefreshCcw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useTerminalCredentials } from "@/lib/hooks/use-api";
import { apiClient } from "@/lib/client-api-call";
import type { TerminalCredentialListItem } from "@/lib/client-api-call";
import { toast } from "sonner";
import { UploadTerminalKeysDialog } from "@/components/shared/upload-terminal-keys-dialog";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debouncedValue;
}

export default function TerminalKeysPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isLoading, refetch } = useTerminalCredentials(
    debouncedSearch.trim() || undefined,
    currentPage,
    limit
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadTerminalKeysDialog, setShowUploadTerminalKeysDialog] =
    useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<TerminalCredentialListItem | null>(null);

  const [addForm, setAddForm] = useState({
    hotel_id: "",
    username: "",
    terminal_key: "",
  });
  const [editForm, setEditForm] = useState({ username: "", terminal_key: "" });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Password confirmation flow
  const [viewStep, setViewStep] = useState<1 | 2>(1);
  const [viewPassword, setViewPassword] = useState("");
  const [viewPasswordError, setViewPasswordError] = useState("");
  const [viewSubmitting, setViewSubmitting] = useState(false);
  const [viewCredentialWithKey, setViewCredentialWithKey] = useState<
    (TerminalCredentialListItem & { terminal_key?: string }) | null
  >(null);
  const [viewEditForm, setViewEditForm] = useState({ username: "", terminal_key: "" });
  const [viewEditSubmitting, setViewEditSubmitting] = useState(false);

  const [editPassword, setEditPassword] = useState("");
  const [editPasswordError, setEditPasswordError] = useState("");
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [editPasswordSubmitting, setEditPasswordSubmitting] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deletePasswordSubmitting, setDeletePasswordSubmitting] = useState(false);

  const [showViewPassword, setShowViewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<"xlsx" | "csv" | null>(null);
  const [exportPassword, setExportPassword] = useState("");
  const [exportPasswordError, setExportPasswordError] = useState("");
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const [showExportPassword, setShowExportPassword] = useState(false);

  const credentials: TerminalCredentialListItem[] =
    (data?.data as TerminalCredentialListItem[]) ?? [];
  const pagination = data?.pagination;

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.terminalCredentials] });
  }, [queryClient]);

  const openExportModal = (format: "xlsx" | "csv") => {
    setPendingExportFormat(format);
    setExportPassword("");
    setExportPasswordError("");
    setShowExportPassword(false);
    setShowExportModal(true);
  };

  const handleExportConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingExportFormat) return;
    setExportPasswordError("");
    setExportSubmitting(true);
    try {
      await apiClient.verifyPassword(exportPassword);
      const ids =
        selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
      const blob = await apiClient.exportTerminalCredentials({
        mask_terminal_key: false,
        format: pendingExportFormat,
        ids,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terminal_credentials.${pendingExportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(
        ids?.length
          ? `Exported ${ids.length} credential(s) as ${pendingExportFormat.toUpperCase()}`
          : `Exported as ${pendingExportFormat.toUpperCase()}`
      );
      setShowExportModal(false);
      setPendingExportFormat(null);
      setExportPassword("");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = apiErr.response?.data?.message;
      if (apiErr.response?.status === 401) {
        setExportPasswordError(msg || "Invalid password");
      } else {
        setExportPasswordError(msg || "Verification failed. Please try again.");
      }
    } finally {
      setExportSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === credentials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(credentials.map((c) => c._id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openViewModal = (cred: TerminalCredentialListItem) => {
    setSelectedCredential(cred);
    setViewStep(1);
    setViewPassword("");
    setViewPasswordError("");
    setViewCredentialWithKey(null);
    setViewEditForm({ username: cred.username, terminal_key: "" });
    setShowViewPassword(false);
    setShowViewModal(true);
  };

  const handleViewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setViewPasswordError("");
    setViewSubmitting(true);
    try {
      await apiClient.verifyPassword(viewPassword);
      const res = await apiClient.getTerminalCredentialById(
        selectedCredential!._id,
        true
      );
      const credWithKey = res.data as TerminalCredentialListItem & {
        terminal_key?: string;
      };
      setViewCredentialWithKey(credWithKey);
      setViewEditForm({
        username: credWithKey.username,
        terminal_key: "",
      });
      setViewStep(2);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = apiErr.response?.data?.message;
      if (apiErr.response?.status === 401) {
        setViewPasswordError(msg || "Invalid password");
      } else {
        setViewPasswordError(msg || "Verification failed. Please try again.");
      }
    } finally {
      setViewSubmitting(false);
    }
  };

  const handleViewSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredential || !viewCredentialWithKey) return;
    if (!viewEditForm.username.trim()) {
      toast.error("Username is required");
      return;
    }
    setViewEditSubmitting(true);
    try {
      const body: { username: string; terminal_key?: string } = {
        username: viewEditForm.username.trim(),
      };
      if (viewEditForm.terminal_key.trim())
        body.terminal_key = viewEditForm.terminal_key;
      await apiClient.updateTerminalCredential(selectedCredential._id, body);
      toast.success("Terminal key updated");
      setShowViewModal(false);
      setSelectedCredential(null);
      setViewCredentialWithKey(null);
      invalidateList();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to update");
    } finally {
      setViewEditSubmitting(false);
    }
  };

  const openEditModalForCred = (cred: TerminalCredentialListItem) => {
    setSelectedCredential(cred);
    setEditForm({ username: cred.username, terminal_key: "" });
    setEditStep(1);
    setEditPassword("");
    setEditPasswordError("");
    setShowEditPassword(false);
    setShowEditModal(true);
  };

  const handleEditPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditPasswordError("");
    setEditPasswordSubmitting(true);
    try {
      await apiClient.verifyPassword(editPassword);
      setEditStep(2);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = apiErr.response?.data?.message;
      if (apiErr.response?.status === 401) {
        setEditPasswordError(msg || "Invalid password");
      } else {
        setEditPasswordError(msg || "Verification failed. Please try again.");
      }
    } finally {
      setEditPasswordSubmitting(false);
    }
  };

  const openDeleteModalForCred = (cred: TerminalCredentialListItem) => {
    setSelectedCredential(cred);
    setDeleteStep(1);
    setDeletePassword("");
    setDeletePasswordError("");
    setShowDeletePassword(false);
    setShowDeleteModal(true);
  };

  const handleDeletePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletePasswordError("");
    setDeletePasswordSubmitting(true);
    try {
      await apiClient.verifyPassword(deletePassword);
      setDeleteStep(2);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = apiErr.response?.data?.message;
      if (apiErr.response?.status === 401) {
        setDeletePasswordError(msg || "Invalid password");
      } else {
        setDeletePasswordError(msg || "Verification failed. Please try again.");
      }
    } finally {
      setDeletePasswordSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username.trim() || !addForm.terminal_key.trim()) {
      toast.error("Username and terminal key are required");
      return;
    }
    setAddSubmitting(true);
    try {
      await apiClient.createTerminalCredential({
        username: addForm.username.trim(),
        terminal_key: addForm.terminal_key,
      });
      toast.success("Terminal key added");
      setShowAddModal(false);
      setAddForm({ hotel_id: "", username: "", terminal_key: "" });
      invalidateList();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = apiErr.response?.data?.message;
      if (apiErr.response?.status === 409) {
        toast.error(msg || "Credential for this username already exists");
      } else {
        toast.error(msg || "Failed to add terminal key");
      }
    } finally {
      setAddSubmitting(false);
    }
  };


  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredential) return;
    if (!editForm.username.trim()) {
      toast.error("Username is required");
      return;
    }
    setEditSubmitting(true);
    try {
      const body: { username: string; terminal_key?: string } = {
        username: editForm.username.trim(),
      };
      if (editForm.terminal_key.trim()) body.terminal_key = editForm.terminal_key;
      await apiClient.updateTerminalCredential(selectedCredential._id, body);
      toast.success("Terminal key updated");
      setShowEditModal(false);
      setSelectedCredential(null);
      invalidateList();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to update");
    } finally {
      setEditSubmitting(false);
    }
  };


  const handleDeleteConfirm = async () => {
    if (!selectedCredential) return;
    setDeleteSubmitting(true);
    try {
      await apiClient.deleteTerminalCredential(selectedCredential._id);
      toast.success("Terminal key deleted");
      setShowDeleteModal(false);
      setSelectedCredential(null);
      invalidateList();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terminal Keys
          </h1>
          <p className="text-gray-600">
            Manage terminal credentials for QP charging (encrypted at rest).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="text-blue-600 hover:bg-blue-600/10 shrink-0 gap-2"
          onClick={() => setShowUploadTerminalKeysDialog(true)}
        >
          <Upload className="h-4 w-4" />
          Upload Terminal Keys
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total credentials</p>
              <div className="text-xl font-bold text-gray-900">
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  pagination?.total ?? credentials.length
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by Username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Terminal Key
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exportSubmitting}>
                  <Download className="h-4 w-4 mr-2" />
                  {selectedIds.size > 0
                    ? `Export selected (${selectedIds.size})`
                    : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => openExportModal("xlsx")}
                  disabled={exportSubmitting}
                >
                  Export as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openExportModal("csv")}
                  disabled={exportSubmitting}
                >
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm p-4 md:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b">
                <TableHead className="w-12">
                  {credentials.length > 0 && (
                    <Checkbox
                      checked={
                        credentials.length > 0 &&
                        selectedIds.size === credentials.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  )}
                </TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Terminal Key</TableHead>
                <TableHead className="text-start">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(5)
                        .fill(0)
                        .map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : credentials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Key className="h-10 w-10 mb-3 opacity-60" />
                      <p className="text-lg font-medium">No terminal keys found</p>
                      <p className="text-sm mt-1">
                        Add one or bulk upload to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                credentials.map((cred) => (
                  <TableRow
                    key={cred._id}
                    className="hover:bg-gray-50/50 border-b border-gray-100"
                  >
                    <TableCell className="py-3">
                      <Checkbox
                        checked={selectedIds.has(cred._id)}
                        onCheckedChange={() => toggleSelectRow(cred._id)}
                        aria-label={`Select ${cred.username}`}
                      />
                    </TableCell>
                    <TableCell className="py-3">{cred.username}</TableCell>
                    <TableCell className="font-mono text-muted-foreground py-3">
                      ••••••••
                    </TableCell>
                    <TableCell className="text-start py-3">
                      {cred.createdAt
                        ? format(new Date(cred.createdAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => openViewModal(cred)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => openEditModalForCred(cred)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDeleteModalForCred(cred)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {credentials.length > 0 && selectedIds.size > 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            Select rows to export only those credentials.
          </p>
        )}
        {data && pagination && pagination.pages > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {credentials.length} of {pagination.total} credentials
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={currentPage === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Terminal Key</DialogTitle>
            <DialogDescription>
              Create a new terminal credential. The key is encrypted before
              storage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-username">Username</Label>
                <Input
                  id="add-username"
                  value={addForm.username}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="QP username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-terminal_key">Terminal Key</Label>
                <Input
                  id="add-terminal_key"
                  type="text"
                  value={addForm.terminal_key}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, terminal_key: e.target.value }))
                  }
                  placeholder="Enter terminal key"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addSubmitting}>
                {addSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal: password then show key + optional edit */}
      <Dialog
        open={showViewModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowViewModal(false);
            setViewStep(1);
            setViewCredentialWithKey(null);
            setSelectedCredential(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View Terminal Key</DialogTitle>
            <DialogDescription>
              {viewStep === 1
                ? "Confirm your password to view the terminal key."
                : "Terminal key details. You can edit below if needed."}
            </DialogDescription>
          </DialogHeader>
          {viewStep === 1 ? (
            <form onSubmit={handleViewPasswordSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="view-password">Confirm your password</Label>
                  <div className="relative">
                    <Input
                      id="view-password"
                      type={showViewPassword ? "text" : "password"}
                      value={viewPassword}
                      onChange={(e) => {
                        setViewPassword(e.target.value);
                        setViewPasswordError("");
                      }}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowViewPassword((p) => !p)}
                      aria-label={showViewPassword ? "Hide password" : "Show password"}
                    >
                      {showViewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {viewPasswordError && (
                    <p className="text-sm text-red-600">{viewPasswordError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={viewSubmitting}>
                  {viewSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Continue
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <div className="space-y-4 py-4">
                {viewCredentialWithKey && (
                  <div className="rounded-lg border bg-gray-50/50 p-4 space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Username:</span>{" "}
                      <span className="font-medium">
                        {viewCredentialWithKey.username}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Terminal Key:
                      </span>{" "}
                      <span className="font-mono">
                        {viewCredentialWithKey.terminal_key ?? "—"}
                      </span>
                    </p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Edit in view</p>
                  <div className="space-y-2">
                    <Label htmlFor="view-edit-username">Username</Label>
                    <Input
                      id="view-edit-username"
                      value={viewEditForm.username}
                      onChange={(e) =>
                        setViewEditForm((p) => ({
                          ...p,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="view-edit-terminal_key">
                      New terminal key (optional)
                    </Label>
                    <Input
                      id="view-edit-terminal_key"
                      type="text"
                      value={viewEditForm.terminal_key}
                      onChange={(e) =>
                        setViewEditForm((p) => ({
                          ...p,
                          terminal_key: e.target.value,
                        }))
                      }
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewStep(1);
                    setViewCredentialWithKey(null);
                    setSelectedCredential(null);
                  }}
                >
                  Close
                </Button>
                <form
                  onSubmit={handleViewSaveChanges}
                  className="contents"
                >
                  <Button type="submit" disabled={viewEditSubmitting}>
                    {viewEditSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Save changes
                  </Button>
                </form>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal: password then form */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowEditModal(false);
            setEditStep(1);
            setSelectedCredential(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Terminal Key</DialogTitle>
            <DialogDescription>
              {editStep === 1
                ? "Confirm your password to edit this credential."
                : "Update username and/or terminal key. Leave key blank to keep the existing one."}
            </DialogDescription>
          </DialogHeader>
          {editStep === 1 ? (
            <form onSubmit={handleEditPasswordSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Confirm your password</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => {
                        setEditPassword(e.target.value);
                        setEditPasswordError("");
                      }}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowEditPassword((p) => !p)}
                      aria-label={showEditPassword ? "Hide password" : "Show password"}
                    >
                      {showEditPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {editPasswordError && (
                    <p className="text-sm text-red-600">{editPasswordError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editPasswordSubmitting}
                >
                  {editPasswordSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Continue
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, username: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-terminal_key">
                    New Terminal Key (optional)
                  </Label>
                  <Input
                    id="edit-terminal_key"
                    type="text"
                    value={editForm.terminal_key}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        terminal_key: e.target.value,
                      }))
                    }
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal: password then delete */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteModal(false);
            setDeleteStep(1);
            setSelectedCredential(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Terminal Key</DialogTitle>
            <DialogDescription>
              {deleteStep === 1
                ? "Confirm your password to delete this credential."
                : `Are you sure you want to delete the credential for username ${selectedCredential?.username}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {deleteStep === 1 ? (
            <form onSubmit={handleDeletePasswordSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">
                    Confirm your password to delete this credential
                  </Label>
                  <div className="relative">
                    <Input
                      id="delete-password"
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeletePasswordError("");
                      }}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowDeletePassword((p) => !p)}
                      aria-label={showDeletePassword ? "Hide password" : "Show password"}
                    >
                      {showDeletePassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {deletePasswordError && (
                    <p className="text-sm text-red-600">{deletePasswordError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={deletePasswordSubmitting}
                >
                  {deletePasswordSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Continue
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
              >
                {deleteSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Delete
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Export: password confirmation then download with real keys */}
      <Dialog
        open={showExportModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowExportModal(false);
            setPendingExportFormat(null);
            setExportPassword("");
            setExportPasswordError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Terminal Keys</DialogTitle>
            <DialogDescription>
              Confirm your password to export terminal keys. The file will
              contain actual key values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExportConfirm}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="export-password">
                  Confirm your password to export terminal keys
                </Label>
                <div className="relative">
                  <Input
                    id="export-password"
                    type={showExportPassword ? "text" : "password"}
                    value={exportPassword}
                    onChange={(e) => {
                      setExportPassword(e.target.value);
                      setExportPasswordError("");
                    }}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowExportPassword((p) => !p)}
                    aria-label={showExportPassword ? "Hide password" : "Show password"}
                  >
                    {showExportPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {exportPasswordError && (
                  <p className="text-sm text-red-600">{exportPasswordError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowExportModal(false);
                  setPendingExportFormat(null);
                  setExportPassword("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={exportSubmitting}>
                {exportSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Export
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UploadTerminalKeysDialog
        open={showUploadTerminalKeysDialog}
        onOpenChange={setShowUploadTerminalKeysDialog}
        onSuccess={() => invalidateList()}
      />
    </div>
  );
}
