"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  FileStack,
  Calendar,
  MessageCircle,
  Bell,
  FileText,
  Search,
  LogOut,
  X,
} from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";

const links = [
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/companies", label: "Companies", icon: Building2 },
  { href: "/student/applications", label: "My Applications", icon: FileStack },
  { href: "/student/interviews", label: "Upcoming Interviews", icon: Calendar },
  { href: "/student/feedback", label: "Interview Feedback", icon: MessageCircle },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/messages", label: "Messages", icon: MessageCircle },
  { href: "/student/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { href: "/student/explore", label: "Explore Companies", icon: Search },
];

interface StudentSidebarProps {
  userId: string;
  open?: boolean;
  onClose?: () => void;
}

export default function StudentSidebar({ userId, open = false, onClose }: StudentSidebarProps) {
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
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-[var(--border)] bg-[var(--bg-sidebar)] shadow-[var(--glow)] transition-transform duration-300 ease-out",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <Link href="/student/profile" onClick={onClose} className="font-semibold">
            Student Portal
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell userType="student" userId={userId} />
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
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold"
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
