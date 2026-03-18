"use client";

import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const [type, setType] = useState<"branch" | "company" | "full">("branch");

  const download = () => {
    window.open(`/api/reports?type=${type}`, "_blank");
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>
      <div className="flex flex-wrap gap-3">
        <Button variant={type === "branch" ? "default" : "outline"} onClick={() => setType("branch")}>
          Branch-wise Summary
        </Button>
        <Button variant={type === "company" ? "default" : "outline"} onClick={() => setType("company")}>
          Company-wise Summary
        </Button>
        <Button variant={type === "full" ? "default" : "outline"} onClick={() => setType("full")}>
          Full Placement Report
        </Button>
      </div>
      <div className="mt-6">
        <Button onClick={download}>Download CSV</Button>
      </div>
    </PageWrapper>
  );
}
