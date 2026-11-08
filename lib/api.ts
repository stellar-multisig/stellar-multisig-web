import { CreateProposalInput, Network, Proposal, SignatureEntry } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.stellar-multisig.dev";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  return request<Proposal>("/proposals", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getProposal(id: string): Promise<Proposal> {
  return request<Proposal>(`/proposals/${id}`);
}

export async function getProposalsByAccount(
  accountAddress: string,
  network: Network
): Promise<Proposal[]> {
  return request<Proposal[]>(
    `/proposals?account=${accountAddress}&network=${network}`
  );
}

export async function addSignature(
  proposalId: string,
  entry: Omit<SignatureEntry, "signedAt">
): Promise<Proposal> {
  return request<Proposal>(`/proposals/${proposalId}/signatures`, {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function markSubmitted(
  proposalId: string,
  txHash: string
): Promise<Proposal> {
  return request<Proposal>(`/proposals/${proposalId}/submit`, {
    method: "POST",
    body: JSON.stringify({ txHash }),
  });
}
