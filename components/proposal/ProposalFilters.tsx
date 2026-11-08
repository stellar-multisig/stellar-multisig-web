"use client";

import { ProposalStatus } from "@/types";

const FILTERS: { value: ProposalStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "ready", label: "Ready" },
  { value: "submitted", label: "Submitted" },
  { value: "expired", label: "Expired" },
];

export function ProposalFilters({
  active,
  onChange,
  counts,
}: {
  active: ProposalStatus | "all";
  onChange: (f: ProposalStatus | "all") => void;
  counts?: Partial<Record<ProposalStatus | "all", number>>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === f.value
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          {f.label}
          {counts?.[f.value] !== undefined && (
            <span className="ml-1 opacity-70">({counts[f.value]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
