"use client";

import { useState } from "react";
import { submitTransaction } from "@/lib/stellar";
import { markSubmitted } from "@/lib/api";
import { MultisigAccount, Proposal } from "@/types";
import { isThresholdMet } from "@/lib/threshold";
import { Spinner } from "@/components/ui/Spinner";
import { stellarExpertUrl } from "@/lib/stellar";

export function SubmitButton({
  proposal,
  account,
  onSubmitted,
}: {
  proposal: Proposal;
  account: MultisigAccount;
  onSubmitted: (txHash: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = isThresholdMet(account, proposal.signatures);

  if (!ready) {
    return (
      <button
        disabled
        className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed"
        title="Threshold not yet met"
      >
        Submit to Network
      </button>
    );
  }

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const txHash = await submitTransaction(proposal.xdr, proposal.network);
      await markSubmitted(proposal.id, txHash);
      onSubmitted(txHash);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Submission failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={submit}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-colors"
      >
        {loading && <Spinner size="sm" />}
        Submit to Network
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
