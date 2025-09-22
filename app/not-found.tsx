"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm p-8 md:p-12 text-center">
          {/* 404 Icon */}
          <div className="relative mb-8">
            <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <Search className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          {/* 404 Title */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4">
            404
          </h1>

          {/* Not Found Message */}
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium min-w-[160px]"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
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
      </div>
    </div>
  );
}
