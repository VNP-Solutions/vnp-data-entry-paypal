"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";

type Step = "verify" | "set-password";

export default function NewUserPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<Step>("verify");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerifyTempPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Add API call to verify temp password
      // For now, just simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to password setup step
      setCurrentStep("set-password");
      toast.success("Temporary password verified successfully");
    } catch {
      toast.error("Invalid temporary password");
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      // TODO: Add API call to set new password
      // For now, just simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Password set successfully! You can now login.");
      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch {
      toast.error("Failed to set new password");
    }
  };

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

          {currentStep === "verify" ? (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-left pb-6">
                <CardTitle className="text-xl font-semibold text-gray-900">Welcome to VNP Solutions</CardTitle>
                <CardDescription className="text-gray-600">
                  Please enter your temporary password to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyTempPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempPassword">Temporary Password</Label>
                    <div className="relative">
                      <Input
                        id="tempPassword"
                        type={showTempPassword ? "text" : "password"}
                        placeholder="Available in your email"
                        value={formData.tempPassword}
                        onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowTempPassword(!showTempPassword)}
                      >
                        {showTempPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Verify Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-left pb-6">
                <CardTitle className="text-xl font-semibold text-gray-900">Set Your Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose a strong password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSetNewPassword} className="space-y-4">
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
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Set New Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
