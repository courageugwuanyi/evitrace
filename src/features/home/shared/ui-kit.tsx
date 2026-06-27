import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileText,
  MessageSquare,
  Github,
  BookOpen,
  Slack,
  Gitlab,
  Trello,
  Figma,
  FileSpreadsheet,
  Presentation,
  GitBranch,
} from "lucide-react";

export const C = {
  bg: "#FAFBFC",
  card: "#FFFFFF",
  border: "#DFE1E6",
  borderStrong: "#C1C7D0",
  primary: "#0052CC",
  primaryHover: "#0065FF",
  primarySoft: "#DEEBFF",
  navy: "#172B4D",
  slate: "#42526E",
  subtle: "#6B778C",
  green: "#36B37E",
  greenSoft: "#E3FCEF",
  amber: "#FFAB00",
  amberSoft: "#FFFAE6",
  red: "#DE350B",
};

const BRAND_ICON_SRC = "/icons/icon128.png?v=20260621";

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src={BRAND_ICON_SRC}
      alt="Evitrace"
      width={size}
      height={size}
      className="rounded object-cover shrink-0"
    />
  );
}

export function Card({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`bg-white border rounded-md shadow-sm ${className}`}
      style={{ borderColor: C.border }}
    >
      {children}
    </div>
  );
}

export function PrimaryBtn({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 px-3 h-9 text-sm font-medium text-white rounded transition-colors ${className}`}
      style={{ background: C.primary }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 px-3 h-9 text-sm font-medium rounded transition-colors hover:bg-[#F4F5F7] ${className}`}
      style={{ color: C.slate }}
    >
      {children}
    </button>
  );
}

export function Pill({
  active,
  onClick,
  children,
  icon,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 h-7 text-xs font-medium rounded-full border transition-all"
      style={{
        background: active ? C.primarySoft : "#F4F5F7",
        color: active ? C.primary : C.slate,
        borderColor: active ? C.primary : "transparent",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function Badge({
  tone = "neutral",
  children,
  icon,
}: {
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const map = {
    neutral: { bg: "#F4F5F7", fg: C.slate },
    success: { bg: C.greenSoft, fg: "#006644" },
    warning: { bg: C.amberSoft, fg: "#974F00" },
    info: { bg: C.primarySoft, fg: C.primary },
    danger: { bg: "#FFEBE6", fg: "#BF2600" },
  } as const;
  const s = map[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 h-6 text-[11px] font-semibold uppercase tracking-wide rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
      style={{ background: s.bg, color: s.fg }}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

const BitbucketIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2.65 3a.65.65 0 0 0-.65.76l2.72 16.5a.88.88 0 0 0 .87.74h13.04a.65.65 0 0 0 .65-.55l2.72-16.69a.65.65 0 0 0-.65-.76zm11.46 11.85h-4.21l-1.14-5.95h6.36z" />
  </svg>
);

const JiraIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M11.53 2a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V2.7a.7.7 0 0 0-.7-.7zM6.18 7.34a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V8.04a.7.7 0 0 0-.7-.7zM.84 12.66a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V13.36a.7.7 0 0 0-.7-.7z"
      transform="scale(0.85)"
    />
  </svg>
);

const ConfluenceIcon = BookOpen;

export function SourceIcon({ source, size = 14 }: { source: string; size?: number }) {
  const s = source.toLowerCase();
  const cls = "shrink-0";
  if (s.includes("bitbucket"))
    return (
      <span className={cls} style={{ color: "#2684FF" }}>
        <BitbucketIcon size={size} />
      </span>
    );
  if (s.includes("jira"))
    return (
      <span className={cls} style={{ color: "#2684FF" }}>
        <JiraIcon size={size} />
      </span>
    );
  if (s.includes("github"))
    return <Github size={size} className={cls} style={{ color: "#24292F" }} />;
  if (s.includes("gitlab"))
    return <Gitlab size={size} className={cls} style={{ color: "#FC6D26" }} />;
  if (s.includes("slack"))
    return <Slack size={size} className={cls} style={{ color: "#4A154B" }} />;
  if (s.includes("teams") || s.includes("microsoft"))
    return <MessageSquare size={size} className={cls} style={{ color: "#5059C9" }} />;
  if (s.includes("excel") || s.includes("sheet"))
    return <FileSpreadsheet size={size} className={cls} style={{ color: "#21A366" }} />;
  if (s.includes("powerpoint") || s.includes("slides"))
    return <Presentation size={size} className={cls} style={{ color: "#D24726" }} />;
  if (s.includes("confluence"))
    return <ConfluenceIcon size={size} className={cls} style={{ color: "#2684FF" }} />;
  if (s.includes("trello"))
    return <Trello size={size} className={cls} style={{ color: "#0079BF" }} />;
  if (s.includes("figma"))
    return <Figma size={size} className={cls} style={{ color: "#A259FF" }} />;
  if (s.includes("git"))
    return <GitBranch size={size} className={cls} style={{ color: C.slate }} />;
  if (s.includes("word") || s.includes("doc"))
    return <FileText size={size} className={cls} style={{ color: "#2B579A" }} />;
  return <FileText size={size} className={cls} style={{ color: C.slate }} />;
}

export function SourceChip({ source }: { source: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-6 text-[11px] font-semibold rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
      style={{ background: "#F4F5F7", color: C.slate }}
    >
      <SourceIcon source={source} size={12} />
      <span className="truncate">{source}</span>
    </span>
  );
}

export function Input({
  icon,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-2.5 pointer-events-none" style={{ color: C.subtle }}>
          {icon}
        </span>
      )}
      <input
        {...rest}
        className={`h-9 ${icon ? "pl-8" : "pl-3"} pr-3 w-full text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none transition-all focus:ring-2 ${className}`}
        style={{
          borderColor: C.border,
          color: C.navy,
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.borderColor = C.primary;
          e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = "#F4F5F7";
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export function Select({
  icon,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-2.5 pointer-events-none" style={{ color: C.subtle }}>
          {icon}
        </span>
      )}
      <select
        {...rest}
        className={`h-9 w-full ${icon ? "pl-8" : "pl-3"} pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none appearance-none cursor-pointer transition-all`}
        style={{ borderColor: C.border, color: C.navy }}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 pointer-events-none"
        style={{ color: C.subtle }}
      />
    </div>
  );
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full max-w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full max-w-full min-w-0 h-auto py-2 pl-3 pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none focus:ring-2 text-left whitespace-normal break-words leading-snug transition-all disabled:opacity-50"
        style={{ borderColor: C.border, color: C.navy }}
      >
        {value || placeholder}
      </button>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: C.subtle }}
      />
      {open && (
        <div
          className="absolute z-20 mt-1 w-full max-w-full rounded border bg-white shadow-lg overflow-y-auto max-h-60"
          style={{ borderColor: C.border }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm whitespace-normal break-words leading-snug hover:bg-[#F4F5F7]"
              style={{ color: C.navy }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Field({
  label,
  children,
  required,
  optional,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-xs font-semibold" style={{ color: C.slate }}>
          {label}
          {required && (
            <span className="ml-0.5" style={{ color: "#DE350B" }}>
              *
            </span>
          )}
        </div>
        {optional && (
          <span className="text-[10px] tracking-wide" style={{ color: C.subtle }}>
            (optional)
          </span>
        )}
      </div>
      {children}
      {hint && (
        <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
          {hint}
        </div>
      )}
    </label>
  );
}
