"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Upload,
  PanelLeftClose,
  PanelLeft,
  FileSpreadsheet,
  CreditCard,
  KeyRound,
  Landmark,
  Users,
  ScrollText,
  Trash2,
  Menu,
  X,
} from "lucide-react";
import { UploadDialog } from "@/components/shared/upload-dialog";
import { UploadTerminalKeysDialog } from "@/components/shared/upload-terminal-keys-dialog";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useProfile } from "@/lib/hooks/use-api";
import { ProfileButton } from "@/components/shared/profile-button";
import logo from "@/public/logo-colored.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COLLAPSED_KEY = "dashboard-sidebar-collapsed";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isVisible: (ctx: { adminEmails: string[]; userEmail: string | null }) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "File History",
    href: "/dashboard/uploads",
    icon: FileSpreadsheet,
    isVisible: () => true,
  },
  {
    label: "QP Payment",
    href: "/dashboard/qp-payment",
    icon: CreditCard,
    isVisible: () => true,
  },
  {
    label: "Terminal Keys",
    href: "/dashboard/terminal-keys",
    icon: KeyRound,
    isVisible: () => true,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: Landmark,
    isVisible: () => true,
  },
  {
    label: "User Management",
    href: "/dashboard/users",
    icon: Users,
    isVisible: () => true,
  },
  {
    label: "Transaction History",
    href: "/dashboard/transactions",
    icon: ScrollText,
    isVisible: ({ adminEmails, userEmail }) =>
      !!userEmail && adminEmails.includes(userEmail),
  },
  {
    label: "Deleted files",
    href: "/dashboard/deleted-files",
    icon: Trash2,
    isVisible: () => true,
  },
];

function NavLinkButton({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard/uploads" && pathname.startsWith(item.href + "/"));

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", active && "text-blue-600")} />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showUploadTerminalKeysDialog, setShowUploadTerminalKeysDialog] =
    useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: profileData } = useProfile();
  const { user } = profileData?.data || { user: null };
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const adminEmails =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) ??
    [];
  const userEmail = user?.email ?? null;

  const visibleNav = navItems.filter((item) =>
    item.isVisible({ adminEmails, userEmail }),
  );

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.uploadSessions] });
  };

  const closeMobile = () => setMobileNavOpen(false);

  const sidebarInner = (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-sm">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-gray-100 p-3",
          collapsed ? "flex-col" : "flex-row",
        )}
      >
        <div className={cn("flex items-center gap-2 min-w-0", collapsed && "flex-col")}>
          <div className="p-1 shrink-0">
            <Image src={logo} alt="VNP" width={collapsed ? 40 : 48} height={48} />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 leading-tight truncate">
                VCC Charge
              </p>
              <p className="text-[10px] text-gray-500">System</p>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("shrink-0 hidden lg:flex", collapsed && "mt-1")}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {visibleNav.map((item) => (
          <NavLinkButton
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={closeMobile}
          />
        ))}
      </nav>

      <div className="border-t border-gray-100 p-2 space-y-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              className={cn(
                "w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700",
                collapsed && "justify-center px-0",
              )}
              onClick={() => {
                setShowUploadDialog(true);
                closeMobile();
              }}
            >
              <Upload className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>Upload</span> : null}
            </Button>
          </TooltipTrigger>
          {collapsed ? (
            <TooltipContent side="right">Upload</TooltipContent>
          ) : null}
        </Tooltip>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start gap-3",
                collapsed && "justify-center px-0",
              )}
              onClick={() => {
                setShowUploadTerminalKeysDialog(true);
                closeMobile();
              }}
            >
              <KeyRound className="h-5 w-5 shrink-0" />
              {!collapsed ? (
                <span className="truncate text-left">Terminal Keys upload</span>
              ) : null}
            </Button>
          </TooltipTrigger>
          {collapsed ? (
            <TooltipContent side="right">Upload Terminal Keys</TooltipContent>
          ) : null}
        </Tooltip>
        <div
          className={cn(
            "pt-2 flex items-center",
            collapsed ? "justify-center" : "justify-between gap-2 px-1",
          )}
        >
          {!collapsed ? (
            <span className="text-xs text-gray-500 truncate flex-1 min-w-0">
              {userEmail || "Account"}
            </span>
          ) : null}
          <ProfileButton />
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
        {/* Mobile header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-2 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-sm font-semibold text-gray-900 truncate">
            VCC Charge System
          </span>
          <div className="w-10 shrink-0" />
        </header>

        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
        ) : null}

        {/* Sidebar: drawer on mobile, rail on desktop */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[70] flex flex-col transition-transform duration-200 ease-out lg:static lg:z-0 lg:translate-x-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            mounted && collapsed ? "lg:w-[4.25rem]" : "lg:w-56",
            "w-56",
          )}
        >
          <div className="flex items-center justify-end border-b border-gray-200 bg-white/95 px-2 py-2 lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              onClick={closeMobile}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {sidebarInner}
        </aside>

        <main className="flex-1 min-w-0 pt-14 lg:pt-0">
          <div className="py-6 px-4 sm:px-8 lg:px-10">{children}</div>
        </main>
      </div>

      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadSuccess={handleUploadSuccess}
      />
      <UploadTerminalKeysDialog
        open={showUploadTerminalKeysDialog}
        onOpenChange={setShowUploadTerminalKeysDialog}
      />
    </TooltipProvider>
  );
}
