import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Proposal } from "@/types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const expired = new Date(proposal.expiresAt) < new Date();
  const effectiveStatus = expired && proposal.status === "pending" ? "expired" : proposal.status;

  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="block rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-slate-500 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {proposal.description || "Untitled Proposal"}
          </p>
          <p className="font-mono text-xs text-slate-500 truncate">
            {proposal.accountAddress}
          </p>
        </div>
        <ProposalStatusBadge status={effectiveStatus} />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span>{proposal.signatures.length} signature{proposal.signatures.length !== 1 ? "s" : ""}</span>
        <span>·</span>
        <span>
          {expired
            ? `Expired ${formatDistanceToNow(new Date(proposal.expiresAt))} ago`
            : `Expires in ${formatDistanceToNow(new Date(proposal.expiresAt))}`}
        </span>
        <span>·</span>
        <span>{proposal.network}</span>
      </div>
    </Link>
  );
}
