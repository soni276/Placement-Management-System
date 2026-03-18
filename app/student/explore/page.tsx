"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import CompanyCard from "@/components/student/CompanyCard";

interface Company {
  id: number;
  name: string;
  roleTitle: string;
  description: string | null;
  ctc: number;
  location: string | null;
  cgpaCutoff: number;
  eligibleBranches: string;
  applicationDeadline: Date | null;
}

interface Student { id: number; branch: string; cgpa: number; }

export default function StudentExplorePage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [locations, setLocations] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<Record<number, string>>({});
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    fetch("/api/companies").then((r) => r.json()).then((data) => {
      setCompanies(data);
      const locs = [...new Set((data as Company[]).map((c) => c.location).filter(Boolean))] as string[];
      setLocations(locs.sort());
    }).catch(() => setCompanies([]));
    if (userId) {
      fetch(`/api/students/${userId}`).then((r) => r.json()).then(setStudent).catch(() => setStudent(null));
      fetch(`/api/applications?studentId=${userId}`).then((r) => r.json()).then((apps: { companyId: number; status: string }[]) => {
        const map: Record<number, string> = {};
        apps.forEach((a) => { map[a.companyId] = a.status; });
        setAppliedIds(map);
      }).catch(() => setAppliedIds({}));
    }
  }, [userId]);

  const filtered = locationFilter === "All"
    ? companies
    : companies.filter((c) => c.location === locationFilter);

  const isEligible = (c: Company) => {
    if (!student) return false;
    if (student.cgpa < c.cgpaCutoff) return false;
    const branches = c.eligibleBranches.split(",").map((b) => b.trim().toUpperCase());
    if (!branches.includes(student.branch.toUpperCase())) return false;
    if (c.applicationDeadline && new Date(c.applicationDeadline) < new Date()) return false;
    return true;
  };

  const onApply = async (companyId: number) => {
    if (!userId) return;
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: parseInt(userId, 10), companyId }),
    });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error || "Failed to apply");
      return;
    }
    toast.success("Applied successfully");
    setAppliedIds((prev) => ({ ...prev, [companyId]: "applied" }));
  };

  if (!student) return <div className="p-8">Loading...</div>;

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Explore Companies</h1>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <option value="All">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-zinc-500">No companies available.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              eligible={isEligible(company)}
              onApply={onApply}
              existingStatus={appliedIds[company.id]}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
