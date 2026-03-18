"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import StudentSidebar from "@/components/layout/StudentSidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "student") {
    router.replace("/student/login");
    return null;
  }

  const userId = (session.user as { id?: string })?.id ?? "0";

  return (
    <div className="flex min-h-screen">
      <StudentSidebar userId={userId} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-card)] px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-[var(--text-primary)]">Student Portal</span>
        </header>
        <main className="flex-1 bg-[var(--bg-primary)] p-4 sm:p-6 md:ml-64 md:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
