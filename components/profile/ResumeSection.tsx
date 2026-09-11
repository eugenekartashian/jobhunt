import type { ChangeEvent, DragEvent, ReactElement, RefObject } from "react";
import { FileText, LoaderCircle, ScanText, Upload } from "lucide-react";

type ResumeSectionProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  resumeName: string;
  existingResumeKey: string | null;
  resumeError: string;
  isInvalid: boolean;
  isUploading: boolean;
  uploadMessage: string;
  canExtract: boolean;
  isExtracting: boolean;
  extractError: string;
  extractMessage: string;
  isGenerating: boolean;
  generateError: string;
  generateMessage: string;
  onExtract: () => void;
  onGenerate: () => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect: () => void;
};

export function ResumeSection({
  fileInputRef,
  isDragging,
  resumeName,
  existingResumeKey,
  resumeError,
  isInvalid,
  isUploading,
  uploadMessage,
  canExtract,
  isExtracting,
  extractError,
  extractMessage,
  isGenerating,
  generateError,
  generateMessage,
  onExtract,
  onGenerate,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onSelect,
}: ResumeSectionProps): ReactElement {
  return (
    <section className="rounded-lg border border-border bg-surface px-5 py-6 shadow-card sm:px-7" aria-busy={isUploading || isExtracting || isGenerating}>
      <h1 className="text-base font-bold text-text-primary">CV</h1>
      <p className="mt-1 text-xs text-text-secondary">Upload an existing CV to auto fill the profile, or generate a new detailed one from your details below.</p>
      <div
        className={`mt-5 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed px-5 text-center transition-all duration-200 ${isDragging ? "scale-[1.01] border-accent bg-accent-muted shadow-card ring-2 ring-accent/20" : "border-border-muted bg-surface-secondary"}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" className="sr-only" onChange={onFileChange} />
        <button type="button" className={`focus-ring flex size-12 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-xl text-text-primary shadow-card transition-all hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 ${isDragging ? "scale-110 text-accent" : ""}`} onClick={onSelect} aria-label="Select CV" disabled={isUploading}><Upload className={`size-5 ${isDragging ? "animate-bounce" : ""}`} aria-hidden="true" /></button>
        {resumeName && !isInvalid ? <p className="mt-3 text-sm font-semibold text-text-primary" aria-live="polite">{resumeName}</p> : <p className="mt-3 text-xs font-bold text-text-dark">Click to upload or drag and drop</p>}
        <p className="mt-1 text-[11px] text-text-secondary">PDF format only. Maximum file size 5MB.</p>
        <button type="button" className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text-primary shadow-card transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60" onClick={onSelect} disabled={isUploading}>{isUploading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}{isUploading ? "Uploading..." : "Select CV"}</button>
      </div>
      {isUploading ? <div className="mt-4 flex items-center gap-3 rounded-md border border-info-light bg-info-lightest px-4 py-3 text-sm font-semibold text-info-dark" role="status"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Uploading your CV...</div> : null}
      {!isUploading && !isInvalid && uploadMessage ? <p className="mt-3 text-sm font-semibold text-success-dark" role="status">{uploadMessage}</p> : null}
      {resumeError ? <p className="mt-3 text-sm text-error" role="alert">{resumeError}</p> : null}
      {existingResumeKey ? <a className="mt-2 inline-block text-xs font-semibold text-accent underline" href="/api/resume" target="_blank" rel="noreferrer">View current CV</a> : null}
      {canExtract ? <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-text-secondary">Auto-fill the form fields below using AI to read your CV.</p>
          {extractMessage ? <p className="mt-2 text-sm font-semibold text-success-dark" role="status">Profile fields filled in. Review and save below.</p> : null}
          {extractError ? <p className="mt-2 text-sm text-error" role="alert">{extractError}</p> : null}
        </div>
        <button type="button" className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" onClick={onExtract} disabled={isExtracting || isUploading}>{isExtracting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ScanText className="size-4" aria-hidden="true" />}{isExtracting ? "Extracting..." : "Extract Profile"}</button>
      </div> : null}
      <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">Need a fresh document based on the info fields below?</p>
          {generateMessage ? <p className="mt-2 text-sm font-semibold text-success-dark" role="status">{generateMessage}</p> : null}
          {generateError ? <p className="mt-2 text-sm text-error" role="alert">{generateError}</p> : null}
          {generateMessage ? <a className="mt-2 inline-block text-sm font-semibold text-accent underline" href="/api/resume" target="_blank" rel="noreferrer">Open generated CV</a> : null}
        </div>
        <button type="button" className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text-primary shadow-card transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60" onClick={onGenerate} disabled={isGenerating || isUploading}>{isGenerating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <FileText className="size-4" aria-hidden="true" />}{isGenerating ? "Generating..." : "Generate CV from Profile"}</button>
      </div>
    </section>
  );
}
