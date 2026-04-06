"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

const QP_TEMPLATE_URL =
  "https://vnpstorage.s3.us-east-1.amazonaws.com/QP-template.xlsx";

interface TemplateDownloadProps {
  onUploadClick?: () => void;
}

export default function TemplateDownload({
  onUploadClick,
}: TemplateDownloadProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
      <div className="mb-2 sm:mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Files</h1>
        <p className="text-gray-600">Monitor and manage uploaded files</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {onUploadClick ? (
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={onUploadClick}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="text-blue-600 hover:bg-blue-600/10 gap-2"
          onClick={() => window.open(QP_TEMPLATE_URL)}
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>
    </div>
  );
}
