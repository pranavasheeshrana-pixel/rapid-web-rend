import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/tiff"];
const MAX_MB = 20;

export interface UploadCandidate {
  file: File;
  error?: string;
}

export function FileUpload({
  onSelect,
  progress,
  busy,
}: {
  onSelect: (candidate: UploadCandidate) => void;
  progress?: number;
  busy?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [candidate, setCandidate] = useState<UploadCandidate | null>(null);

  const validate = (file: File): UploadCandidate => {
    if (!ACCEPTED.includes(file.type)) return { file, error: "Unsupported type — use PDF, PNG, JPEG or TIFF." };
    if (file.size > MAX_MB * 1024 * 1024) return { file, error: `File exceeds the ${MAX_MB} MB limit.` };
    return { file };
  };

  const handle = (file?: File | null) => {
    if (!file) return;
    const result = validate(file);
    setCandidate(result);
    onSelect(result);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-gradient-to-br from-card to-background",
        )}
      >
        <Upload className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-[13px] font-medium">Drop a document here, or click to browse</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          PDF · PNG · JPEG · TIFF · max {MAX_MB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      {candidate ? (
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[13px] font-medium">{candidate.file.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {Math.max(1, Math.round(candidate.file.size / 1024))} KB
            </span>
          </div>
          {candidate.error ? (
            <p className="mt-1.5 font-mono text-[11px] text-risk">{candidate.error}</p>
          ) : (
            <>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                {busy ? `Uploading · ${progress ?? 0}%` : progress === 100 ? "Upload complete" : "Ready to upload"}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
