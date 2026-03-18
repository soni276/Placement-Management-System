"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import ApplicationsManager from "@/components/admin/ApplicationsManager";

interface Company {
  id: number;
  name: string;
  roleTitle: string;
}

interface Application {
  id: number;
  studentId: number;
  status: string;
  student: { name: string; regNo: string; branch: string; cgpa: number; resumePath: string | null };
}

export default function ManageApplicationsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/companies").then((r) => r.json()).then((data) => {
      setCompanies(data);
      if (data.length && !selectedCompanyId) setSelectedCompanyId(data[0].id);
    }).catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    fetch(`/api/applications?companyId=${selectedCompanyId}`)
      .then((r) => r.json())
      .then(setApps)
      .catch(() => setApps([]));
  }, [selectedCompanyId]);

  const onStatusChange = async (appId: number, status: string) => {
    const res = await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update");
      return;
    }
    toast.success("Status updated");
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
  };

  const company = companies.find((c) => c.id === selectedCompanyId);
  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Manage Applications</h1>
      <ApplicationsManager
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={setSelectedCompanyId}
        applications={apps}
        onStatusChange={onStatusChange}
      />
    </PageWrapper>
  );
}
