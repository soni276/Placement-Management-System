"use client";

import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";

interface App {
  id: number;
  status: string;
  student: { name: string; regNo: string; branch: string; cgpa: number; resumePath: string | null };
}

interface Company {
  id: number;
  name: string;
  roleTitle: string;
}

export default function ApplicationsManager({
  companies,
  selectedCompanyId,
  onSelectCompany,
  applications,
  onStatusChange,
}: {
  companies: Company[];
  selectedCompanyId: number | null;
  onSelectCompany: (id: number) => void;
  applications: App[];
  onStatusChange: (appId: number, status: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Select Company</label>
        <select
          value={selectedCompanyId ?? ""}
          onChange={(e) => onSelectCompany(Number(e.target.value))}
          className="w-full max-w-md rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.roleTitle}
            </option>
          ))}
        </select>
      </div>
      {applications.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-zinc-500">No applications.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{app.student.name} ({app.student.regNo})</p>
                  <p className="text-sm text-zinc-500">{app.student.branch} | CGPA: {app.student.cgpa}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={app.status} />
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value)}
                    className="rounded border px-2 py-1 text-sm min-w-[120px]"
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {app.student.resumePath && (
                    <a href={app.student.resumePath} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 whitespace-nowrap">
                      Resume
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
