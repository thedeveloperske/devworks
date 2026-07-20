"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"] as const;
const ACCEPTED_MIME_TYPES = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const acceptAttr = [
  ...ACCEPTED_EXTENSIONS,
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

type UploadRowResult = {
  rowNumber: number;
  memberNo?: string;
  familyNo?: string;
  name?: string;
  error?: string;
};

type UploadResponse = {
  created: number;
  failed: number;
  results: UploadRowResult[];
  error?: string;
};

function hasAcceptedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isAcceptedFile(file: File) {
  if (hasAcceptedExtension(file.name)) return true;
  if (file.type && ACCEPTED_MIME_TYPES.has(file.type)) return true;
  return false;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MemberUploadPageClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<UploadRowResult[]>([]);

  const closeModal = useCallback(() => {
    router.replace("/admin/medical");
  }, [router]);

  const selectFile = useCallback((next: File | null) => {
    setError("");
    setNotice("");
    setResults([]);
    if (!next) {
      setFile(null);
      return;
    }
    if (!isAcceptedFile(next)) {
      setFile(null);
      setError("Please choose a CSV or Excel file (.csv, .xlsx, .xls).");
      return;
    }
    setFile(next);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError("");
    setNotice("");
    setResults([]);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] ?? null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    selectFile(dropped);
  };

  const processFile = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError("");
    setNotice("");
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/medical/members/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as UploadResponse;

      if (!res.ok) {
        setError(data.error ?? "Failed to process file");
        setProcessing(false);
        return;
      }

      setResults(data.results ?? []);
      setNotice(
        `Processed ${data.created + data.failed} row${
          data.created + data.failed === 1 ? "" : "s"
        }: ${data.created} created, ${data.failed} failed.`
      );
      router.refresh();
    } catch {
      setError("Failed to process file");
    } finally {
      setProcessing(false);
    }
  };

  const failedResults = results.filter((row) => row.error);
  const createdResults = results.filter((row) => !row.error);

  return (
    <div className="relative min-h-[calc(100dvh-13rem)]">
      <div className="pointer-events-none opacity-40">
        <PageHeader
          title="Upload Members"
          description="Import members from an Excel or CSV file"
        />
      </div>

      <Modal
        open
        onClose={closeModal}
        title="Upload Members"
        description="Pick an Excel or CSV file, then process it into member tables"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            className="sr-only"
            onChange={onInputChange}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={onDrop}
            className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 text-center transition-colors ${
              dragging
                ? "border-maroon bg-maroon/5"
                : "border-slate-300 bg-slate-50 hover:border-maroon/50 hover:bg-white"
            }`}
          >
            <Upload
              className={`h-6 w-6 ${dragging ? "text-maroon" : "text-slate-400"}`}
              aria-hidden
            />
            <p className="text-[12px] font-semibold text-slate-800">
              Drop a file here, or click to browse
            </p>
            <p className="text-[12px] text-slate-500">
              Accepted formats: .csv, .xlsx, .xls
            </p>
            <p className="max-w-md text-[11px] text-slate-400">
              Required columns: corpId, surname, firstName, dob, gender,
              category. Optional: startDate, endDate, status, mobileNo, email,
              employmentNo, idPpNo, occupation, bloodGroup, otherNames.
            </p>
          </div>

          {error ? (
            <p className="text-[12px] text-red-600">{error}</p>
          ) : null}
          {notice ? (
            <p className="text-[12px] text-emerald-700">{notice}</p>
          ) : null}

          {file ? (
            <div className="flex items-start gap-3 border border-slate-200 bg-white px-3 py-2.5">
              <FileSpreadsheet
                className="mt-0.5 h-4 w-4 shrink-0 text-maroon"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-slate-900">
                  {file.name}
                </p>
                <p className="text-[12px] text-slate-500">
                  {formatFileSize(file.size)}
                  {file.type ? ` · ${file.type}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={clearFile}
                disabled={processing}
              >
                Remove
              </Button>
            </div>
          ) : (
            <p className="text-[12px] text-slate-500">No file selected.</p>
          )}

          {results.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-auto border border-slate-200">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500">
                      Row
                    </th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500">
                      Member
                    </th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...createdResults, ...failedResults].map((row) => (
                    <tr key={`${row.rowNumber}-${row.memberNo ?? row.error}`}>
                      <td className="border-b border-slate-200 px-2 py-1.5 text-[12px] text-slate-600">
                        {row.rowNumber}
                      </td>
                      <td className="border-b border-slate-200 px-2 py-1.5 text-[12px] text-slate-600">
                        {row.memberNo
                          ? `${row.memberNo}${row.name ? ` — ${row.name}` : ""}`
                          : "—"}
                      </td>
                      <td
                        className={`border-b border-slate-200 px-2 py-1.5 text-[12px] ${
                          row.error ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {row.error ?? "Created"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-auto flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={closeModal}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!file || processing}
              onClick={processFile}
            >
              {processing ? "Processing..." : "Process file"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
