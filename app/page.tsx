"use client"

import type React from "react"

import { useState } from "react"
import { Upload, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Component() {
  const router = useRouter()
  const [workId, setWorkId] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Handle form submission logic here
    console.log("Work ID:", workId)
    console.log("Selected file:", selectedFile)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3">
                <Image src="https://www.vnpsolutions.com/img/VNP-logo.svg" alt="VNP Logo" width={100} height={100} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">VNP Solutions</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">VCC Charge System</div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Upload your work file and get started with the VCC charge process</p>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">Get Started</CardTitle>
              <CardDescription className="text-gray-600">
                Please provide your work ID and upload your current work file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Work ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="workId" className="text-sm font-medium text-gray-700">
                    VNP Work ID
                  </Label>
                  <Input
                    id="workId"
                    type="text"
                    placeholder="VNP Work ID assigned to you"
                    value={workId}
                    onChange={(e) => setWorkId(e.target.value)}
                    className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="workFile" className="text-sm font-medium text-gray-700">
                    Current Work File
                  </Label>
                  <div className="relative">
                    <input
                      id="workFile"
                      type="file"
                      onChange={handleFileChange}
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <label
                      htmlFor="workFile"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-700">
                          {selectedFile ? selectedFile.name : "Choose file or drag and drop"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX up to 10MB</div>
                      </div>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      File selected: {selectedFile.name}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!workId || !selectedFile}
                  onClick={() => {
                    router.push("/main")
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Need help? Contact VNP Support for assistance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
