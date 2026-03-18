"use client";

import { useEffect, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import StatsCard from "@/components/dashboard/StatsCard";
import PlacementBarChart from "@/components/dashboard/PlacementBarChart";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import { Users, Building2, FileStack, CheckCircle } from "lucide-react";

interface Stats {
  totalStudents: number;
  totalCompanies: number;
  totalApplications: number;
  selectedStudents: number;
  companyWise: Array<{ company: string; selected_students: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Placement Overview Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Students" value={stats?.totalStudents ?? 0} icon={<Users className="h-8 w-8" />} />
        <StatsCard label="Companies" value={stats?.totalCompanies ?? 0} icon={<Building2 className="h-8 w-8" />} />
        <StatsCard label="Applications" value={stats?.totalApplications ?? 0} icon={<FileStack className="h-8 w-8" />} />
        <StatsCard label="Selected" value={stats?.selectedStudents ?? 0} icon={<CheckCircle className="h-8 w-8" />} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold">Company-wise Placements</h3>
          {stats?.companyWise?.length ? (
            <PlacementBarChart data={stats.companyWise} />
          ) : (
            <p className="text-zinc-500">No data yet.</p>
          )}
        </div>
        <div className="rounded-xl border bg-white p-6 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold">Application Status Distribution</h3>
          {stats?.statusDistribution?.length ? (
            <StatusPieChart data={stats.statusDistribution} />
          ) : (
            <p className="text-zinc-500">No data yet.</p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
