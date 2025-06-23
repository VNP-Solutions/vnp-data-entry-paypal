"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: ""
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await apiClient.login({
        email: formData.email,
        password: formData.password
      })
      if (response.status === 'success' && response.data.step === 'otp_required') {
        setShowOtpForm(true)
        toast.success(response.data.message)
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiClient.verifyOtp({
        otp: formData.otp
      })
      if (response.status === 'success') {
        toast.success(response.message)
        router.push("/dashboard/main")
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.resendOtp()
      if (response.status === 'success') {
        toast.success(response.message)
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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

          {/* Login/OTP Form */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-left pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {showOtpForm ? "Enter OTP" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {showOtpForm ? "Please enter the OTP sent to your email" : "Please sign in to your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={showOtpForm ? handleOtpVerification : handleLogin} className="space-y-4">
                {!showOtpForm ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    <div className="flex items-center justify-between">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : (showOtpForm ? "Verify OTP" : "Sign In")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {!showOtpForm && (
                  <div className="text-center mt-4">
                    <span className="text-gray-600">Don&apos;t have an account?</span>{" "}
                    <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium">
                      Sign Up
                    </Link>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
