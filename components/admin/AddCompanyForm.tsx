"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1),
  roleTitle: z.string().min(1),
  description: z.string().optional(),
  ctc: z.number().min(0),
  location: z.string().optional(),
  cgpaCutoff: z.number().min(0).max(10),
  eligibleBranches: z.array(z.string()).min(1),
  applicationDeadline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddCompanyForm({
  branches,
  onSubmit,
}: {
  branches: string[];
  onSubmit: (data: FormData) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { eligibleBranches: branches, ctc: 0, cgpaCutoff: 0 },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input {...register("name")} className="mt-1" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Role Title</Label>
            <Input {...register("roleTitle")} className="mt-1" />
            {errors.roleTitle && <p className="text-sm text-red-500">{errors.roleTitle.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              {...register("description")}
              className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>CTC (LPA)</Label>
              <Input type="number" step={0.1} {...register("ctc", { valueAsNumber: true })} className="mt-1" />
            </div>
            <div>
              <Label>Location</Label>
              <Input {...register("location")} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>CGPA Cutoff</Label>
            <Input type="number" step={0.01} {...register("cgpaCutoff", { valueAsNumber: true })} className="mt-1" />
          </div>
          <div>
            <Label>Eligible Branches</Label>
            <select
              multiple
              {...register("eligibleBranches")}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">Hold Ctrl/Cmd to select multiple</p>
          </div>
          <div>
            <Label>Application Deadline (optional)</Label>
            <Input type="datetime-local" {...register("applicationDeadline")} className="mt-1" />
          </div>
          <Button type="submit">Add Company</Button>
        </form>
      </CardContent>
    </Card>
  );
}
