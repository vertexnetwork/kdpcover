"use client";

import { useRef, useState } from "react";
import { UploadCloud, Lock } from "lucide-react";
import { clsx } from "clsx";

// Drag-and-drop + picker. Hands the raw File(s) back to the parent; all parsing
// happens in the browser, so the privacy promise ("never uploaded") holds.

const ACCEPT = ".pdf,.png,.jpg,.jpeg";

type Props = {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
};

export function FileDropzone({ onFiles, multiple = false, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const emit = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) emit(e.dataTransfer.files);
      }}
      className={clsx(
        "rounded-card border-2 border-dashed p-8 text-center transition-colors",
        dragging ? "border-warm-400 bg-warm-50" : "border-sage-300 bg-sage-50/50",
        disabled && "opacity-60",
      )}
    >
      <UploadCloud className="mx-auto h-8 w-8 text-sage-600" aria-hidden />
      <p className="mt-3 text-sm font-medium text-ink">
        Drop your cover {multiple ? "files" : "file"} here
      </p>
      <p className="mt-1 text-xs text-sage-700">PDF, PNG, or JPG{multiple ? " — drop as many as you like" : ""}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-300 bg-white px-4 py-2 text-sm font-medium hover:border-warm-400 disabled:cursor-not-allowed"
      >
        Choose {multiple ? "files" : "file"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => emit(e.target.files)}
      />
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-sage-700">
        <Lock className="h-3 w-3" aria-hidden />
        Checked in your browser — your file is never uploaded.
      </p>
    </div>
  );
}
