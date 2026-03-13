"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const QP_TEMPLATE_URL =
  "https://vnpstorage.s3.us-east-1.amazonaws.com/QP-template.xlsx";

export default function TemplateDownload() {
  return (
    <div className="flex justify-between items-start">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Files</h1>
        <p className="text-gray-600">Monitor and manage uploaded files</p>
      </div>
      <Button
        variant="outline"
        className="text-blue-600 hover:bg-blue-600/10"
        onClick={() => window.open(QP_TEMPLATE_URL)}
      >
        <Download className="h-4 w-4" />
        Download Template
      </Button>
    </div>
  );
}
