"use client";

import { useState } from "react";
import { useProfile } from "@/lib/hooks/use-api";
import { apiClient } from "@/lib/client-api-call";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LogOut, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";

export function ProfileButton() {
  const { data: profileData } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    apiClient.logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!profileData?.data?.user) return null;

  const { user } = profileData.data;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity ">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mt-2">
          <DropdownMenuItem 
            onClick={() => setShowProfileModal(true)}
            className="cursor-pointer hover:bg-blue-50"
          >
            <User className="mr-2 h-4 w-4 text-blue-600" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-red-200 text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Profile Information
            </DialogTitle>
           
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <h4 className="font-medium text-sm">Name</h4>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <h4 className="font-medium text-sm">Email</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-4 w-4 text-gray-500" />
                <div>
                  <h4 className="font-medium text-sm">Account Status</h4>
                  <p className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <h4 className="font-medium text-sm">Last Login</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(user.lastLogin), "PPpp")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <h4 className="font-medium text-sm">Member Since</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt || ""), "PPpp")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 