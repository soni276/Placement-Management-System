"use client";

import FileUploader from "@/components/shared/FileUploader";

export default function BulkUploadCSV({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
  return (
    <div className="rounded-xl border p-6">
      <p className="mb-4 text-sm text-zinc-500">
        Upload CSV with columns: company_name, role, package, location, min_cgpa
      </p>
      <FileUploader accept=".csv" onUpload={onUpload} label="Choose CSV file" />
    </div>
  );
}
