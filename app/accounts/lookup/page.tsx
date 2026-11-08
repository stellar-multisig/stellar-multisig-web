"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NetworkSelector } from "@/components/wallet/NetworkSelector";
import { Network } from "@/types";

export default function LookupPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<Network>("testnet");
  const [error, setError] = useState<string | null>(null);

  const go = () => {
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Enter an account address.");
      return;
    }
    if (!trimmed.startsWith("G") && !trimmed.startsWith("C")) {
      setError("Address must start with G (classic) or C (Soroban contract).");
      return;
    }
    if (trimmed.length < 56) {
      setError("Address looks too short. Stellar addresses are 56 characters.");
      return;
    }
    router.push(`/accounts/${trimmed}?network=${network}`);
  };

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Look up an account</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter any Stellar account address to view its signers, thresholds, and proposals.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Account Address</label>
          <input
            value={address}
            onChange={(e) => { setAddress(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="G… or C…"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Network</label>
          <NetworkSelector value={network} onChange={setNetwork} />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={go}
          className="rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          View Account
        </button>
      </div>
    </div>
  );
}
