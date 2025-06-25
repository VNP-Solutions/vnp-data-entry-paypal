"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/client-api-call";

// Import the type from client-api-call.ts
interface InviteData {
  name?: string;
  email: string;
  isInvite: true;
}

export default function InvitePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const params: InviteData = {
        email: formData.email,
        isInvite: true,
      };
      
      if (formData.name.trim()) {
        params.name = formData.name.trim();
      }

      await apiClient.register(params);
      toast.success("Invitation sent! User will receive instructions via email.");
      // Clear form
      setFormData({ name: "", email: "" });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to send invitation");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      {/* Header */}
      <div className="mb-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite Users</h1>
        <p className="text-gray-600">Send invitations to new team members</p>
      </div>

      {/* Invitation Form */}
      <Card className="max-w-lg w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-left pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">Send Invitation</CardTitle>
          <CardDescription className="text-gray-600">
            Enter the email address of the person you&apos;d like to invite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter their email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter their name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700"
            >
              Send Invitation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 