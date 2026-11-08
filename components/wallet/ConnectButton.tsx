"use client";

import { useWallet } from "@/hooks/useWallet";
import { Spinner } from "@/components/ui/Spinner";

export function ConnectButton() {
  const { address, connected, installed, loading, error, connect, disconnect } =
    useWallet();

  if (installed === null) return null;

  if (!installed) {
    return (
      <a
        href="https://freighter.app"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
      >
        Install Freighter
      </a>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-red-700 hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        {loading && <Spinner size="sm" />}
        Connect Freighter
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
