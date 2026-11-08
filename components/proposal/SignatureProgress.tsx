import { MultisigAccount, SignatureEntry } from "@/types";
import {
  progressPercent,
  thresholdNeeded,
  weightCollected,
} from "@/lib/threshold";

export function SignatureProgress({
  account,
  signatures,
}: {
  account: MultisigAccount;
  signatures: SignatureEntry[];
}) {
  const collected = weightCollected(account, signatures);
  const needed = thresholdNeeded(account);
  const pct = progressPercent(account, signatures);
  const met = collected >= needed;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Signature weight</span>
        <span className={met ? "text-green-400 font-semibold" : "text-slate-300"}>
          {collected} / {needed}
          {met && " ✓"}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            met ? "bg-green-500" : "bg-sky-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        {signatures.length} signature{signatures.length !== 1 ? "s" : ""} collected
        {!met && ` — need ${needed - collected} more weight`}
      </p>
    </div>
  );
}
