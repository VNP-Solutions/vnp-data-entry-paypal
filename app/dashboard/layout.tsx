"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Upload,
  PanelLeftClose,
  FileSpreadsheet,
  CreditCard,
  KeyRound,
  Landmark,
  Users,
  ScrollText,
  Trash2,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { UploadDialog } from "@/components/shared/upload-dialog";
import { UploadTerminalKeysDialog } from "@/components/shared/upload-terminal-keys-dialog";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useProfile } from "@/lib/hooks/use-api";
import { apiClient } from "@/lib/client-api-call";
import logo from "@/public/logo-colored.png";
import { Separator } from "@/components/ui/separator";
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
  isVisible: (ctx: {
    adminEmails: string[];
    userEmail: string | null;
  }) => boolean;
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
    (item.href !== "/dashboard/uploads" &&
      pathname.startsWith(item.href + "/"));

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
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];
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

  const handleLogout = () => {
    closeMobile();
    apiClient.logout();
  };

  const logoImg = (opts: { collapsed: boolean; className?: string }) => (
    <Image
      src={logo}
      alt="VNP Solutions"
      width={opts.collapsed ? 52 : 96}
      height={opts.collapsed ? 52 : 96}
      className={cn(
        "h-auto max-w-none object-contain",
        opts.collapsed ? "w-[52px]" : "w-24",
        opts.className,
      )}
      sizes={opts.collapsed ? "52px" : "96px"}
      priority
    />
  );

  const sidebarInner = (
    <div className="flex flex-1 min-h-0 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-sm">
      {/* Mobile drawer: logo only (app name lives in main top bar) */}
      <div className="flex shrink-0 justify-center px-4 py-3 lg:hidden">
        <div className="shrink-0 leading-none">
          {logoImg({ collapsed: false })}
        </div>
      </div>

      {/* Desktop expanded: logo | collapse */}
      {!collapsed ? (
        <div className="hidden shrink-0 items-center justify-between gap-2 px-4 py-3 lg:flex">
          <div className="shrink-0 leading-none">
            {logoImg({ collapsed: false })}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-600"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>
      ) : null}

      {/* Desktop collapsed: logo only — click to expand */}
      {collapsed ? (
        <div className="hidden shrink-0 justify-center px-2 py-3 lg:flex">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="shrink-0 rounded-lg p-1 leading-none text-gray-700 outline-none ring-offset-2 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            {logoImg({ collapsed: true })}
          </button>
        </div>
      ) : null}

      <Separator className="mx-3 shrink-0 bg-gray-200" />

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
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

      <div className="mt-auto shrink-0 border-t border-gray-200 bg-white/95 p-2 space-y-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              className={cn(
                "w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700 text-white",
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
                "w-full justify-start gap-3 border-gray-200",
                collapsed && "justify-center px-0",
              )}
              onClick={() => {
                setShowUploadTerminalKeysDialog(true);
                closeMobile();
              }}
            >
              <KeyRound className="h-5 w-5 shrink-0" />
              {!collapsed ? (
                <span className="truncate text-left">Terminal Keys Upload</span>
              ) : null}
            </Button>
          </TooltipTrigger>
          {collapsed ? (
            <TooltipContent side="right">Terminal Keys Upload</TooltipContent>
          ) : null}
        </Tooltip>

        <Separator className="my-2 bg-gray-200" />

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700",
                collapsed && "justify-center px-0",
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>Logout</span> : null}
            </Button>
          </TooltipTrigger>
          {collapsed ? (
            <TooltipContent side="right">Logout</TooltipContent>
          ) : null}
        </Tooltip>
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
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-gray-900">
              VCC Charge System
            </span>
          </div>
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
            "lg:h-svh lg:max-h-svh lg:sticky lg:top-0 lg:overflow-hidden",
            mobileNavOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
            mounted && collapsed ? "lg:w-[4.25rem]" : "lg:w-56",
            "w-56",
          )}
        >
          <div className="flex shrink-0 items-center justify-end border-b border-gray-200 bg-white/95 px-2 py-2 lg:hidden">
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

        <main className="flex min-h-0 min-w-0 flex-1 flex-col pt-14 lg:pt-0">
          <div className="sticky top-0 z-30 hidden shrink-0 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-8 lg:flex lg:px-10">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-lg font-semibold leading-tight text-gray-900">
                VCC Charge System
              </span>
            </div>
          </div>
          <div className="min-h-0 flex-1 py-6 px-4 sm:px-8 lg:px-10">
            {children}
          </div>
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
