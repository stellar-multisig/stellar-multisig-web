"use client";

import { Network } from "@/types";

const NETWORKS: { value: Network; label: string }[] = [
  { value: "testnet", label: "Testnet" },
  { value: "mainnet", label: "Mainnet" },
  { value: "futurenet", label: "Futurenet" },
];

export function NetworkSelector({
  value,
  onChange,
}: {
  value: Network;
  onChange: (n: Network) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Network)}
      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 focus:border-sky-500 focus:outline-none"
    >
      {NETWORKS.map((n) => (
        <option key={n.value} value={n.value}>
          {n.label}
        </option>
      ))}
    </select>
  );
}
