"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useState } from "react";

export default function TemplateDownload() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownloadTemplate = (templateType: "paypal" | "stripe") => {
    // Using the same URL for both templates for now
    // TODO: Use templateType to determine different URLs when updated
    console.info(`Downloading ${templateType} template`);
    const paypalTemplateUrl =
      "https://vnpstorage.s3.us-east-1.amazonaws.com/uploads/1753255148635-Template.xlsx";
    const stripeTemplateUrl =
      "https://vnpstorage.s3.us-east-1.amazonaws.com/uploads/1756641401178-Stripe Template.xlsx";
    window.open(
      templateType === "paypal" ? paypalTemplateUrl : stripeTemplateUrl
    );
    setIsDialogOpen(false);
  };

  return (
    <div className="flex justify-between items-start">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Files</h1>
        <p className="text-gray-600">Monitor and manage uploaded files</p>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="text-blue-600 hover:bg-blue-600/10"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Template</DialogTitle>
            <DialogDescription>
              Choose which template you would like to download
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => handleDownloadTemplate("paypal")}
              className="w-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-600/90 hover:text-white"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              PayPal Template
            </Button>
            <Button
              onClick={() => handleDownloadTemplate("stripe")}
              className="w-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-600/90 hover:text-white"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Stripe Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
