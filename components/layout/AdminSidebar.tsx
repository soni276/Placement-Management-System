"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  FileStack,
  Calendar,
  Users,
  ClipboardList,
  MessageSquare,
  Bell,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";

const links = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/add-company", label: "Add Company", icon: Building2 },
  { href: "/admin/manage-applications", label: "Manage Applications", icon: FileStack },
  { href: "/admin/schedule-interview", label: "Schedule Interview", icon: Calendar },
  { href: "/admin/panel-slots", label: "Panel & Slots", icon: Users },
  { href: "/admin/interview-management", label: "Interview Management", icon: ClipboardList },
  { href: "/admin/interview-feedback", label: "Interview Feedback", icon: ClipboardList },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "glow-nav fixed left-0 top-0 z-50 h-screen w-64 border-r border-[var(--border)] bg-[var(--bg-card)] transition-transform duration-300 ease-out",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <Link href="/admin/overview" onClick={onClose} className="font-semibold">Admin Portal</Link>
          <div className="flex items-center gap-2">
            <NotificationBell userType="admin" userId="0" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] glow-card"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
