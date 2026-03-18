"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FileUploader from "@/components/shared/FileUploader";

interface Student {
  id: number;
  regNo: string;
  name: string;
  email: string;
  phone: string | null;
  branch: string;
  cgpa: number;
  passoutYear: number;
  resumePath: string | null;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{ phone: string }>();

  const userId = (session?.user as { id?: string })?.id;
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/students/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setStudent(data);
        setValue("phone", data.phone || "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId, setValue]);

  const onUpdatePhone = async (data: { phone: string }) => {
    if (!userId) return;
    const res = await fetch(`/api/students/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: data.phone || null }),
    });
    if (!res.ok) {
      toast.error("Failed to update phone");
      return;
    }
    toast.success("Phone updated");
    const updated = await res.json();
    setStudent((s) => (s ? { ...s, phone: updated.phone } : null));
  };

  const onResumeUpload = async (file: File) => {
    if (!userId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", userId);
    const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");

    const updateRes = await fetch(`/api/students/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumePath: json.resumePath }),
    });
    if (!updateRes.ok) throw new Error("Failed to save resume path");
    toast.success("Resume uploaded");
    setStudent((s) => (s ? { ...s, resumePath: json.resumePath } : null));
  };

  if (loading || !student) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Reg No:</strong> {student.regNo}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Branch:</strong> {student.branch}</p>
            <p><strong>CGPA:</strong> {student.cgpa}</p>
            <p><strong>Passout Year:</strong> {student.passoutYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Update Phone (for WhatsApp)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onUpdatePhone)} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone with country code</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+919876543210"
                  className="mt-1"
                />
              </div>
              <Button type="submit">Save Phone</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resume</CardTitle>
        </CardHeader>
        <CardContent>
          {student.resumePath && (
            <a
              href={student.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-block text-blue-600 hover:underline"
            >
              Download current resume
            </a>
          )}
          <FileUploader
            accept=".pdf"
            onUpload={onResumeUpload}
            label="Upload resume (PDF)"
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
