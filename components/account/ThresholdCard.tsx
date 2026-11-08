import { MultisigAccount } from "@/types";

function ThresholdRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
        highlight ? "bg-sky-900/30 border border-sky-800" : "bg-slate-800/50"
      }`}
    >
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-sky-300" : "text-slate-200"}`}>
        {value}
      </span>
    </div>
  );
}

export function ThresholdCard({ account }: { account: MultisigAccount }) {
  if (account.type === "soroban") {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-300">Threshold</h3>
        <ThresholdRow
          label="Signatures required"
          value={account.sorobanThreshold ?? 1}
          highlight
        />
        <ThresholdRow label="Total signers" value={account.signers.length} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300">Thresholds</h3>
      <ThresholdRow label="Low" value={account.thresholds.low} />
      <ThresholdRow label="Medium" value={account.thresholds.medium} highlight />
      <ThresholdRow label="High" value={account.thresholds.high} />
    </div>
  );
}
