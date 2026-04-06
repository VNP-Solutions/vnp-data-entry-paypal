"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trash2, RotateCcw, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import {
  useTrashedUploadSessions,
  useRestoreUploadSession,
} from "@/lib/hooks/use-api";

interface TrashedSession {
  uploadId: string;
  fileName: string;
  paymentGateway: string;
  deletedAt: string;
  purgeEligibleAt: string | null;
  daysRemaining: number;
  linkedQpChargeFileId: string | null;
}

interface TrashResponse {
  status: string;
  data: {
    sessions: TrashedSession[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export default function DeletedFilesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useTrashedUploadSessions(
    page,
    limit,
    searchTerm,
    "qp",
  );
  const restoreMutation = useRestoreUploadSession();

  const payload = data as TrashResponse | undefined;
  const sessions = payload?.data?.sessions ?? [];
  const pagination = payload?.data?.pagination;

  return (
    <div className="min-h-[80vh] w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trash2 className="h-7 w-7 text-amber-700" />
          Deleted files
        </h1>
        <p className="text-gray-600 mt-1">
          Files stay here for 90 days, then they are permanently removed. You
          can restore them to File History anytime before then.
        </p>
      </div>

      <Card className="w-full border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button variant="outline" type="button" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="w-full border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>File</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead>Days left</TableHead>
              <TableHead className="text-end">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(5)
                      .fill(0)
                      .map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No deleted files in the last 90 days.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((s) => (
                <TableRow key={s.uploadId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{s.fileName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium uppercase">
                    {s.paymentGateway}
                  </TableCell>
                  <TableCell>
                    {s.deletedAt
                      ? format(new Date(s.deletedAt), "MMM d, yyyy HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        s.daysRemaining <= 7
                          ? "text-amber-800 font-medium"
                          : ""
                      }
                    >
                      {s.daysRemaining}
                    </span>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1.5"
                      disabled={restoreMutation.isPending}
                      onClick={() =>
                        restoreMutation.mutateAsync(s.uploadId).catch(() => {})
                      }
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination && pagination.pages > 1 ? (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} (
              {pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
