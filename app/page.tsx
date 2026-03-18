"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Building2, FileStack, CheckCircle, Menu, X } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import PlacementBarChart from "@/components/dashboard/PlacementBarChart";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

interface Stats {
  totalStudents: number;
  totalCompanies: number;
  totalApplications: number;
  selectedStudents: number;
  companyWise: Array<{ company: string; selected_students: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    gsap.from(".hero-title", { duration: 1, y: 60, opacity: 0, ease: "power3.out" });
    gsap.from(".hero-desc", { duration: 1, y: 30, opacity: 0, delay: 0.2, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".section-card").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  }, []);

  return (
    <div className="min-h-screen animate-gradient">
      <nav className="glow-nav relative sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-base font-bold text-[var(--text-primary)] sm:text-xl"
          >
            Placement Portal
          </motion.h1>

          {/* Desktop: buttons */}
          <div className="hidden items-center gap-2 sm:flex sm:gap-4">
            <Link href="/student/register">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Register
              </Button>
            </Link>
            <Link href="/student/login">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Student Login
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Admin Login
              </Button>
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className="flex rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] sm:hidden"
            aria-label={navOpen ? "Close menu" : "Open menu"}
          >
            {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full border-b border-[var(--border)] bg-[var(--bg-card)] p-4 sm:hidden"
          >
            <div className="flex flex-col gap-2">
              <Link
                href="/student/register"
                onClick={() => setNavOpen(false)}
                className="block rounded-lg px-4 py-3 text-center font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Register
              </Link>
              <Link
                href="/student/login"
                onClick={() => setNavOpen(false)}
                className="block rounded-lg px-4 py-3 text-center font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Student Login
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setNavOpen(false)}
                className="block rounded-lg bg-[var(--accent)] px-4 py-3 text-center font-medium text-white hover:opacity-90"
              >
                Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-16">
          <h2 className="hero-title glow-text text-4xl font-bold text-[var(--text-primary)] md:text-5xl">
            Placement Management System
          </h2>
          <p className="hero-desc mt-3 text-lg text-[var(--text-secondary)]">
            Central platform for students and admins to manage placements, applications, and interviews
          </p>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label="Total Students"
              value={stats?.totalStudents ?? 0}
              icon={<Users className="h-8 w-8" />}
            />
            <StatsCard
              label="Total Companies"
              value={stats?.totalCompanies ?? 0}
              icon={<Building2 className="h-8 w-8" />}
            />
            <StatsCard
              label="Total Applications"
              value={stats?.totalApplications ?? 0}
              icon={<FileStack className="h-8 w-8" />}
            />
            <StatsCard
              label="Selected Students"
              value={stats?.selectedStudents ?? 0}
              icon={<CheckCircle className="h-8 w-8" />}
            />
          </div>
        </section>

        <section className="mb-12">
          <h3 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">Get Started</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="section-card glow-card animate-pulse-glow">
              <CardHeader>
                <CardTitle>For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
                  <li>Register your profile</li>
                  <li>Explore companies and job roles</li>
                  <li>Check eligibility automatically</li>
                  <li>Apply and track your status</li>
                </ul>
                <Link href="/student/register" className="mt-4 inline-block">
                  <Button>Register Now</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="section-card glow-card animate-pulse-glow">
              <CardHeader>
                <CardTitle>For Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
                  <li>Add companies and job openings</li>
                  <li>View applicants for each company</li>
                  <li>Shortlist and finalize selections</li>
                  <li>View placement outcome summaries</li>
                </ul>
                <Link href="/admin/login" className="mt-4 inline-block">
                  <Button>Admin Login</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">Statistics</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="section-card glow-card">
              <CardHeader>
                <CardTitle>Company-wise Placements</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.companyWise?.length ? (
                  <PlacementBarChart data={stats.companyWise} />
                ) : (
                  <p className="text-zinc-500">No placement data yet.</p>
                )}
              </CardContent>
            </Card>
            <Card className="section-card glow-card">
              <CardHeader>
                <CardTitle>Application Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.statusDistribution?.length ? (
                  <StatusPieChart data={stats.statusDistribution} />
                ) : (
                  <p className="text-zinc-500">No application data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-[var(--text-muted)]">
          © Placement Management System
        </footer>
      </main>
    </div>
  );
}
