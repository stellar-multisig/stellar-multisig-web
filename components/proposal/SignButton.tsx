"use client";

import { useState } from "react";
import { signXdr } from "@/lib/freighter";
import { addSignature } from "@/lib/api";
import { Network, Proposal } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

export function SignButton({
  proposal,
  signerAddress,
  onSigned,
}: {
  proposal: Proposal;
  signerAddress: string;
  onSigned: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadySigned = proposal.signatures.some(
    (s) => s.signerAddress === signerAddress
  );

  const isExpired = proposal.status === "expired";
  const isSubmitted = proposal.status === "submitted";

  const sign = async () => {
    setLoading(true);
    setError(null);
    try {
      const signedXdr = await signXdr(proposal.xdr, proposal.network);
      await addSignature(proposal.id, {
        signerAddress,
        signature: signedXdr,
      });
      onSigned();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Signing failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (alreadySigned) {
    return (
      <div className="rounded-lg border border-green-800 bg-green-950/30 px-4 py-3 text-sm text-green-400">
        ✓ You have signed this proposal
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-500">
        This proposal has expired and can no longer be signed
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-sky-800 bg-sky-950/30 px-4 py-3 text-sm text-sky-400">
        This proposal has already been submitted
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={sign}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-colors"
      >
        {loading && <Spinner size="sm" />}
        Sign with Freighter
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
