"use client";

import { useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { CreateProposalForm } from "@/components/proposal/CreateProposalForm";
import { Network } from "@/types";

export default function NewProposalPage() {
  const searchParams = useSearchParams();
  const accountAddress = searchParams.get("account") ?? "";
  const network = (searchParams.get("network") ?? "testnet") as Network;
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <p className="text-lg font-medium text-slate-300">Connect your wallet to create a proposal</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">New Proposal</h1>
        <p className="text-sm text-slate-400 mt-1">
          Build or paste a transaction, decode it, then create a proposal for signers to review and sign.
        </p>
      </div>

      {!accountAddress && (
        <div className="rounded-lg border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-300">
          No account address provided. Go to an account page and click "New Proposal", or add{" "}
          <code className="text-amber-200">?account=G…</code> to the URL.
        </div>
      )}

      {accountAddress && (
        <CreateProposalForm accountAddress={accountAddress} network={network} />
      )}
    </div>
  );
}
