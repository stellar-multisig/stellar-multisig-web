import { Proposal } from "@/types";

export function isProposalExpired(proposal: Proposal): boolean {
  return new Date(proposal.expiresAt) < new Date();
}

export function isProposalActionable(proposal: Proposal): boolean {
  if (isProposalExpired(proposal)) return false;
  return proposal.status === "pending" || proposal.status === "ready";
}

export function expiryLabel(proposal: Proposal): string {
  const expired = isProposalExpired(proposal);
  const date = new Date(proposal.expiresAt);
  const abs = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return expired ? `Expired ${abs}` : `Expires ${abs}`;
}
