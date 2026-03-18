"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";

interface App {
  id: number;
  status: string;
  appliedAt: string;
  company: { name: string; roleTitle: string };
}

export default function StudentApplicationsPage() {
  const { data: session } = useSession();
  const [apps, setApps] = useState<App[]>([]);
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/applications?studentId=${userId}`)
      .then((r) => r.json())
      .then(setApps)
      .catch(() => setApps([]));
  }, [userId]);

  if (!userId) return <div className="p-8">Loading...</div>;

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">My Applications</h1>
      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-500">
            You have not applied to any companies yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{app.company.name} — {app.company.roleTitle}</p>
                  <p className="text-sm text-zinc-500">
                    Applied at: {new Date(app.appliedAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
