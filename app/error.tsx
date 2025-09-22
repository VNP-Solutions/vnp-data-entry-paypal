"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCcw,
  Home,
  ArrowLeft,
  Bug,
  Zap,
} from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Error Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm p-8 md:p-12 text-center">
          {/* Error Icon with Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-red-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>

          {/* Error Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We encountered an unexpected error while processing your request.
            Please inform our team about this error.
          </p>

          {/* Error Details (Development Mode) */}
          {process.env.NODE_ENV === "development" && (
            <Card className="bg-gray-50 border border-gray-200 p-4 mb-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Development Error Details
                </span>
              </div>
              <div className="text-sm text-gray-600 font-mono bg-white p-3 rounded border overflow-auto max-h-32">
                {error.message || "Unknown error occurred"}
              </div>
              {error.digest && (
                <div className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </div>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium min-w-[160px]"
            >
              <RefreshCcw className="h-5 w-5 mr-2" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-medium min-w-[160px]"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  );
}