"use client";

import { useState, useRef } from "react";
import { Upload, X, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiClient } from "@/lib/client-api-call";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    if (validFiles.length !== files.length) {
      toast.error("Only Excel files (.xlsx) are allowed");
      return;
    }

    setSelectedFiles(validFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    if (validFiles.length !== files.length) {
      toast.error("Only Excel files (.xlsx) are allowed");
      return;
    }

    setSelectedFiles(validFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsLoading(true);
    try {
      // Upload files sequentially
      for (const file of selectedFiles) {
        const response = await apiClient.uploadFile(file);
        if (response.status !== "success") {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)`);
      setSelectedFiles([]);
      onOpenChange(false); // Close dialog after successful upload
      onUploadSuccess?.(); // Trigger refetch of uploads data
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to upload files");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
          <DialogDescription>
            Drag and drop your Excel file here or click to browse
          </DialogDescription>
        </DialogHeader>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            selectedFiles.length > 0
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx"
            className="hidden"
            multiple
          />

          {selectedFiles.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 p-2 rounded"
                  >
                    <FileSpreadsheet className="h-6 w-6" />
                    <span className="font-medium text-sm">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-blue-100 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading {selectedFiles.length} file(s)...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {selectedFiles.length} File(s)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFiles}
                  disabled={isLoading}
                >
                  Clear All
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="space-y-4 w-full"
            >
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <div className="text-gray-600">
                <span className="text-blue-600 font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
                <div className="text-sm">
                  Excel files only (.xlsx) - Multiple files allowed
                </div>
              </div>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
