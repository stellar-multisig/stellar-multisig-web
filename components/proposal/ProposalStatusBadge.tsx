import { ProposalStatus } from "@/types";

const CONFIG: Record<ProposalStatus, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-slate-800 border-slate-600 text-slate-300",
  },
  ready: {
    label: "Ready to Submit",
    classes: "bg-green-900/40 border-green-700 text-green-300",
  },
  submitted: {
    label: "Submitted",
    classes: "bg-sky-900/40 border-sky-700 text-sky-300",
  },
  expired: {
    label: "Expired",
    classes: "bg-slate-900 border-slate-700 text-slate-500",
  },
  failed: {
    label: "Failed",
    classes: "bg-red-950/40 border-red-800 text-red-400",
  },
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const { label, classes } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
