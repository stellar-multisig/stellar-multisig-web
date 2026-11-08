"use client";

import { useWallet } from "@/hooks/useWallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import Link from "next/link";

export default function AccountsPage() {
  const { connected, address } = useWallet();

  if (!connected || !address) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <p className="text-lg font-medium text-slate-300">Connect your wallet to see accounts you sign for</p>
        <p className="text-sm text-slate-500 max-w-sm">
          Freighter will provide your public key. We'll look up multisig accounts where you're a registered signer.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Your Accounts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Multisig accounts where{" "}
            <span className="font-mono text-sky-400">
              {address.slice(0, 8)}…{address.slice(-6)}
            </span>{" "}
            is a signer
          </p>
        </div>
        <Link
          href="/accounts/lookup"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 transition-colors"
        >
          Look up any account
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 flex flex-col items-center gap-3 text-center">
        <p className="text-slate-400 text-sm">
          Account discovery requires the coordinator API to index Horizon events.
        </p>
        <p className="text-slate-500 text-xs max-w-md">
          Enter any multisig account address directly, or use the lookup page to inspect an account by address.
        </p>
        <Link
          href="/accounts/lookup"
          className="mt-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Look up an account
        </Link>
      </div>
    </div>
  );
}
