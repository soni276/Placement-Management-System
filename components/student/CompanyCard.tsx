"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

export default function CompanyCard({
  company,
  eligible,
  onApply,
  existingStatus,
}: {
  company: Company;
  eligible: boolean;
  onApply: (id: number) => void;
  existingStatus?: string;
}) {
  const [applying, setApplying] = useState(false);
  const deadline = company.applicationDeadline
    ? new Date(company.applicationDeadline).toLocaleString()
    : "Not specified";

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(company.id);
    } finally {
      setApplying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
    <Card className="glow-card hover:shadow-[var(--glow-strong)] transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold sm:text-lg break-words">{company.name} - {company.roleTitle}</h3>
            <span className={`text-sm ${eligible ? "text-green-600" : "text-amber-600"}`}>
              {eligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {!existingStatus && eligible && (
              <Button onClick={handleApply} disabled={applying} size="sm" className="w-full sm:w-auto">
                {applying ? "Applying..." : "Apply"}
              </Button>
            )}
            {existingStatus && (
              <span className="text-sm text-zinc-500">Applied: {existingStatus}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {company.description && <p>{company.description}</p>}
        <p><strong>CTC:</strong> {company.ctc} LPA</p>
        <p><strong>Location:</strong> {company.location || "N/A"}</p>
        <p><strong>CGPA Cutoff:</strong> {company.cgpaCutoff}</p>
        <p><strong>Eligible Branches:</strong> {company.eligibleBranches}</p>
        <p><strong>Deadline:</strong> {deadline}</p>
      </CardContent>
    </Card>
    </motion.div>
  );
}
