"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "@/hooks/useAccount";
import { useProposals } from "@/hooks/useProposals";
import { useWallet } from "@/hooks/useWallet";
import { Network } from "@/types";
import { SignerList } from "@/components/account/SignerList";
import { ThresholdCard } from "@/components/account/ThresholdCard";
import { AccountTypeBadge } from "@/components/account/AccountTypeBadge";
import { ProposalCard } from "@/components/proposal/ProposalCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyButton } from "@/components/ui/CopyButton";

export default function AccountPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const searchParams = useSearchParams();
  const network = (searchParams.get("network") ?? "testnet") as Network;
  const { address: walletAddress } = useWallet();

  const { account, loading: accountLoading, error: accountError, reload } = useAccount(address, network);
  const { proposals, loading: proposalsLoading } = useProposals(address, network);

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (accountError) {
    return (
      <ErrorState
        message={accountError}
        onRetry={reload}
      />
    );
  }

  if (!account) return null;

  const pending = proposals.filter((p) => p.status === "pending" || p.status === "ready");
  const past = proposals.filter((p) => p.status === "submitted" || p.status === "expired" || p.status === "failed");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-100">Account</h1>
            <AccountTypeBadge type={account.type} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-400 break-all">{address}</span>
            <CopyButton text={address} />
          </div>
        </div>
        <Link
          href={`/proposals/new?account=${address}&network=${network}`}
          className="shrink-0 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          + New Proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SignerList signers={account.signers} highlightAddress={walletAddress ?? undefined} />
        </div>
        <ThresholdCard account={account} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">
            Pending Proposals ({pending.length})
          </h2>
          {proposalsLoading && <Spinner size="sm" />}
        </div>
        {pending.length === 0 ? (
          <EmptyState
            title="No pending proposals"
            description="Create a proposal to start collecting signatures."
            action={
              <Link
                href={`/proposals/new?account=${address}&network=${network}`}
                className="rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Create Proposal
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-200">
            Past Proposals ({past.length})
          </h2>
          <div className="flex flex-col gap-3">
            {past.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
