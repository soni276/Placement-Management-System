"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "motion/react";
import PageWrapper from "@/components/layout/PageWrapper";
import CompanyCard from "@/components/student/CompanyCard";
import { Card, CardContent } from "@/components/ui/card";

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

interface Student {
  id: number;
  branch: string;
  cgpa: number;
}

export default function StudentCompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [appliedIds, setAppliedIds] = useState<Record<number, string>>({});

  const userId = (session?.user as { id?: string })?.id;
  useEffect(() => {
    fetch("/api/companies").then((r) => r.json()).then(setCompanies).catch(() => setCompanies([]));
    if (userId) {
      fetch(`/api/students/${userId}`).then((r) => r.json()).then(setStudent).catch(() => setStudent(null));
      fetch(`/api/applications?studentId=${userId}`).then((r) => r.json()).then((apps: { companyId: number; status: string }[]) => {
        const map: Record<number, string> = {};
        apps.forEach((a) => { map[a.companyId] = a.status; });
        setAppliedIds(map);
      }).catch(() => setAppliedIds({}));
    }
  }, [userId]);

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
      <h1 className="mb-6 text-2xl font-bold">Available Companies</h1>
      {companies.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-500">No companies available yet.</CardContent>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="space-y-4"
        >
          {companies.map((company, i) => (
            <motion.div key={company.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <CompanyCard
                company={company}
                eligible={isEligible(company)}
                onApply={onApply}
                existingStatus={appliedIds[company.id]}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageWrapper>
  );
}
