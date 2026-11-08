"use client";

import { use, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { useProposal } from "@/hooks/useProposal";
import { useAccount } from "@/hooks/useAccount";
import { useWallet } from "@/hooks/useWallet";
import { XdrDecoder } from "@/components/proposal/XdrDecoder";
import { SignatureProgress } from "@/components/proposal/SignatureProgress";
import { SignerStatusList } from "@/components/proposal/SignerStatusList";
import { SignButton } from "@/components/proposal/SignButton";
import { SubmitButton } from "@/components/proposal/SubmitButton";
import { ProposalStatusBadge } from "@/components/proposal/ProposalStatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { CopyButton } from "@/components/ui/CopyButton";
import { stellarExpertUrl } from "@/lib/stellar";
import { DecodedTransaction } from "@/types";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { proposal, loading, error, reload } = useProposal(id);
  const { address: walletAddress, network: walletNetwork } = useWallet();
  const { account } = useAccount(
    proposal?.accountAddress ?? null,
    proposal?.network ?? "testnet"
  );

  const [xdrConfirmed, setXdrConfirmed] = useState(false);
  const [submittedHash, setSubmittedHash] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (!proposal) return null;

  const isExpired =
    new Date(proposal.expiresAt) < new Date() && proposal.status === "pending";
  const effectiveStatus = isExpired ? "expired" : proposal.status;

  const isSigner =
    walletAddress &&
    account?.signers.some((s) => s.address === walletAddress);

  const networkMismatch =
    walletAddress && walletNetwork !== proposal.network;

  const txHash = submittedHash ?? proposal.submittedTxHash;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-slate-100">
              {proposal.description || "Untitled Proposal"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Created {formatDistanceToNow(new Date(proposal.createdAt))} ago
              </span>
              <span>·</span>
              <span>
                {isExpired
                  ? `Expired ${formatDistanceToNow(new Date(proposal.expiresAt))} ago`
                  : `Expires ${formatDistanceToNow(new Date(proposal.expiresAt), { addSuffix: true })}`}
              </span>
              <span>·</span>
              <span className="capitalize">{proposal.network}</span>
            </div>
          </div>
          <ProposalStatusBadge status={effectiveStatus} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Account:</span>
          <Link
            href={`/accounts/${proposal.accountAddress}?network=${proposal.network}`}
            className="font-mono text-xs text-sky-400 hover:underline truncate"
          >
            {proposal.accountAddress}
          </Link>
          <CopyButton text={proposal.accountAddress} />
        </div>
      </div>

      {/* Submitted result */}
      {txHash && (
        <div className="rounded-xl border border-green-800 bg-green-950/30 p-5 flex flex-col gap-2">
          <p className="text-sm font-semibold text-green-400">✓ Transaction submitted</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-300 break-all">{txHash}</span>
            <CopyButton text={txHash} />
          </div>
          <a
            href={stellarExpertUrl(txHash, proposal.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:underline"
          >
            View on Stellar Expert →
          </a>
        </div>
      )}

      {/* Network mismatch warning */}
      {networkMismatch && (
        <div className="rounded-lg border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-300">
          ⚠ Your wallet is on <strong>{walletNetwork}</strong> but this proposal is for{" "}
          <strong>{proposal.network}</strong>. Switch networks in Freighter before signing.
        </div>
      )}

      {/* Transaction decode — must happen before signing */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">Transaction</h2>
          <div className="flex items-center gap-2">
            <CopyButton text={proposal.xdr} label="Copy XDR" />
          </div>
        </div>
        <XdrDecoder
          xdr={proposal.xdr}
          onAllRisksAcknowledged={() => setXdrConfirmed(true)}
        />
      </div>

      {/* Signature progress */}
      {account && (
        <div className="flex flex-col gap-6 rounded-xl border border-slate-700 bg-slate-900 p-5">
          <SignatureProgress account={account} signatures={proposal.signatures} />
          <SignerStatusList
            account={account}
            signatures={proposal.signatures}
            currentAddress={walletAddress ?? undefined}
          />
        </div>
      )}

      {/* Actions */}
      {!txHash && effectiveStatus !== "submitted" && (
        <div className="flex flex-col gap-4">
          {!xdrConfirmed && (
            <p className="text-sm text-amber-400">
              ↑ Decode and confirm the transaction above before you can sign.
            </p>
          )}

          {xdrConfirmed && isSigner && walletAddress && !networkMismatch && (
            <SignButton
              proposal={proposal}
              signerAddress={walletAddress}
              onSigned={reload}
            />
          )}

          {xdrConfirmed && !isSigner && walletAddress && (
            <p className="text-sm text-slate-500">
              Your connected address is not a registered signer on this account.
            </p>
          )}

          {xdrConfirmed && account && (
            <SubmitButton
              proposal={proposal}
              account={account}
              onSubmitted={(hash) => {
                setSubmittedHash(hash);
                reload();
              }}
            />
          )}
        </div>
      )}

      {/* Raw XDR toggle */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-400 select-none">
          Show raw XDR
        </summary>
        <pre className="mt-2 rounded-lg bg-slate-800 p-4 text-xs text-slate-400 font-mono break-all whitespace-pre-wrap overflow-auto max-h-40">
          {proposal.xdr}
        </pre>
      </details>
    </div>
  );
}
