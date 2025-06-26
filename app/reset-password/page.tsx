"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { apiClient } from "@/lib/client-api-call"

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (!resetToken) {
      toast.error("Reset token is missing")
      router.push('/auth/forgot-password')
    }
  }, [resetToken, router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetToken) return

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.resetPassword(resetToken, {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      if (response.status === 'success') {
        toast.success(response.message)
        router.push('/')
      }
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.response?.data?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (!resetToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3">
                <Image src="https://www.vnpsolutions.com/img/VNP-logo.svg" alt="VNP Logo" width={100} height={100} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">VNP Solutions</div>
                <div className="text-2xl font-bold text-gray-900">VCC Charge System</div>
              </div>
            </div>
          </div>

          {/* Reset Password Form */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-left pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">Reset Password</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Reset Password"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center mt-4">
                  <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
} 