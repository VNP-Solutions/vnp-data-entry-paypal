"use client"

import { useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { UploadDialog } from "@/components/upload-dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      label: "Home",
      href: "/dashboard/main",
    },
    {
      label: "Uploaded Files",
      href: "/dashboard/uploads",
    },
    {
      label: "Uploaded Entries",
      href: "/dashboard/entity",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2">
                  <Image
                    src="https://www.vnpsolutions.com/img/VNP-logo.svg"
                    alt="VNP Logo"
                    width={100}
                    height={100}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    VCC Charge System
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative",
                    pathname === item.href
                      ? "text-blue-600 font-semibold before:content-[''] before:absolute before:left-0 before:right-0 before:-bottom-[1.3rem] before:h-0.5 before:bg-blue-600 before:rounded-full"
                      : "text-gray-600 hover:text-blue-600"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                onClick={() => setShowUploadDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Page content */}
      <main className="py-8 px-10">
        {children}
      </main>
      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  )
} 