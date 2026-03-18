"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Papa from "papaparse";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import AddCompanyForm from "@/components/admin/AddCompanyForm";
import BulkUploadCSV from "@/components/admin/BulkUploadCSV";
import { BRANCHES } from "@/types";

const manualSchema = z.object({
  name: z.string().min(1),
  roleTitle: z.string().min(1),
  description: z.string().optional(),
  ctc: z.number().min(0),
  location: z.string().optional(),
  cgpaCutoff: z.number().min(0).max(10),
  eligibleBranches: z.array(z.string()).min(1),
  applicationDeadline: z.string().optional(),
});

export default function AddCompanyPage() {
  const [mode, setMode] = useState<"manual" | "bulk">("manual");

  const onManualSubmit = async (data: z.infer<typeof manualSchema>) => {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        eligibleBranches: data.eligibleBranches.join(","),
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : null,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error || "Failed");
      return;
    }
    toast.success("Company added");
  };

  const onBulkUpload = async (file: File) => {
    const text = await file.text();
    const ext = file.name.toLowerCase();
    let rows: Record<string, string | number>[] = [];
    if (ext.endsWith(".csv")) {
      const parsed = Papa.parse<Record<string, string>>(text, { header: true });
      rows = parsed.data;
    } else {
      toast.error("CSV only for now");
      return;
    }
    const payload = rows
      .filter((r) => r.company_name || r.name)
      .map((r) => ({
        company_name: r.company_name || r.name,
        role: r.role || r.role_title,
        package: r.package ?? r.ctc ?? 0,
        location: r.location ?? "",
        min_cgpa: r.min_cgpa ?? r.cgpaCutoff ?? 0,
      }));
    const res = await fetch("/api/companies/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) toast.error(json.error || "Failed");
    else toast.success(`Added ${json.added}, skipped ${json.skipped}`);
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Add Company</h1>
      <div className="mb-6 flex gap-4">
        <button
          className={`rounded px-4 py-2 ${mode === "manual" ? "bg-zinc-900 text-white" : "bg-zinc-200"}`}
          onClick={() => setMode("manual")}
        >
          Manual
        </button>
        <button
          className={`rounded px-4 py-2 ${mode === "bulk" ? "bg-zinc-900 text-white" : "bg-zinc-200"}`}
          onClick={() => setMode("bulk")}
        >
          Bulk CSV
        </button>
      </div>
      {mode === "manual" ? (
        <AddCompanyForm branches={[...BRANCHES]} onSubmit={onManualSubmit} />
      ) : (
        <BulkUploadCSV onUpload={onBulkUpload} />
      )}
    </PageWrapper>
  );
}
