"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANCHES } from "@/types";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    branch: z.enum(BRANCHES as unknown as [string, ...string[]]),
    cgpa: z.number().min(0).max(10),
    passoutYear: z.number().min(2020).max(2100),
    password: z.string().min(6, "Password must be 6+ characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function StudentRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { branch: "CSE", cgpa: 0, passoutYear: new Date().getFullYear() },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || null,
          branch: data.branch,
          cgpa: data.cgpa,
          passoutYear: data.passoutYear,
          password: data.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.details || json.error || "Registration failed");
      const regNo = json.regNo as string;
      toast.success(`Registration successful! Your Reg No: ${regNo}. Save it for login.`, { duration: 5000 });
      setTimeout(() => router.push("/student/login"), 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center animate-gradient px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Student Registration</CardTitle>
            <p className="text-sm text-zinc-500">Create your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="rounded-lg bg-violet-50/80 px-3 py-2 text-sm text-violet-700 dark:bg-violet-950/50 dark:text-violet-200">
                Registration Number will be auto-generated after you register.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <Input {...register("name")} placeholder="John Doe" />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input type="email" {...register("email")} placeholder="john@example.com" />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Branch</label>
                <select
                  {...register("branch")}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">CGPA</label>
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    max={10}
                    {...register("cgpa", { valueAsNumber: true })}
                  />
                  {errors.cgpa && <p className="mt-1 text-sm text-red-500">{errors.cgpa.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Passout Year</label>
                  <Input
                    type="number"
                    {...register("passoutYear", { valueAsNumber: true })}
                  />
                  {errors.passoutYear && (
                    <p className="mt-1 text-sm text-red-500">{errors.passoutYear.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
                <Input {...register("phone")} placeholder="+919876543210" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input type="password" {...register("password")} />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Confirm Password</label>
                <Input type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
              <p className="text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link href="/student/login" className="text-[var(--accent)] font-medium hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
