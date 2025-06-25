"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Users, Clock, CheckCircle, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/client-api-call";
import { useMyInvitations } from "@/lib/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/hooks/use-api";

// Import the type from client-api-call.ts
interface InviteData {
  name?: string;
  email: string;
  isInvite: true;
}

interface Invitation {
  id: string;
  email: string;
  name?: string;
  status: string;
  createdAt: string;
}

interface InvitationStatistics {
  total: number;
  pending: number;
  completed: number;
  active: number;
}

interface InvitationResponse {
  data: {
    statistics: InvitationStatistics;
    invitations: Invitation[];
  };
}

export default function InvitePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const { data: invitationData, isLoading } = useMyInvitations(currentPage, limit) as { data: InvitationResponse | undefined, isLoading: boolean };
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
      // Invalidate and refetch invitations data
      queryClient.invalidateQueries({ queryKey: [queryKeys.invitations] });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/80">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Total Invitations</p>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{invitationData?.data.statistics.total || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Pending Invitations</p>
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold">{invitationData?.data.statistics.pending || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Completed Invitations</p>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{invitationData?.data.statistics.completed || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Active Invitations</p>
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold">{invitationData?.data.statistics.active || 0}</p>
                </CardContent>
              </Card>
            </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Invitation Form */}
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Users</h1>
            <p className="text-gray-600">Send invitations to new team members</p>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Invitation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Statistics and Table */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invitation Statistics</h2>
            <p className="text-gray-600 mb-6">Total invitations sent: {invitationData?.data.statistics.total || 0}</p>
            
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Invitations</CardTitle>
              <CardDescription>List of all invitations you&apos;ve sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Name</th>
                      <th scope="col" className="px-6 py-3">Email</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!invitationData?.data?.invitations?.length ? (
                      <tr className="bg-white">
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No invitations sent yet
                        </td>
                      </tr>
                    ) : invitationData?.data?.invitations ? (
                      invitationData.data.invitations.map((invitation: Invitation) => (
                        <tr key={invitation.id} className="bg-white border-b">
                          <td className="px-6 py-4">{invitation.name || "-"}</td>
                          <td className="px-6 py-4">{invitation.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              invitation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              invitation.status === "completed" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {invitation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(invitation.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
                {invitationData?.data?.invitations && invitationData.data.invitations.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                        disabled={currentPage === 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(page => page + 1)}
                        disabled={!invitationData?.data?.invitations || invitationData.data.invitations.length < limit || isLoading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 