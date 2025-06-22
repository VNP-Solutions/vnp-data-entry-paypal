"use client"

import { useState, useRef } from "react"
import { Upload, X, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { apiClient } from "@/lib/client-api-call"

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
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast.error('Please select an Excel file (.xlsx)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast.error('Please select an Excel file (.xlsx)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.uploadFile(selectedFile);
      if (response.status === 'success') {
        toast.success(response.message || 'File uploaded successfully');
        setSelectedFile(null);
        onOpenChange(false); // Close dialog after successful upload
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
          <DialogDescription>
            Drag and drop your Excel file here or click to browse
          </DialogDescription>
        </DialogHeader>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
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
          />

          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <FileSpreadsheet className="h-8 w-8" />
                <span className="font-medium">{selectedFile.name}</span>
                <button
                  onClick={clearFile}
                  className="p-1 hover:bg-blue-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Button
                onClick={handleUpload}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
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
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and
                drop
                <div className="text-sm">Excel files only (.xlsx)</div>
              </div>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 