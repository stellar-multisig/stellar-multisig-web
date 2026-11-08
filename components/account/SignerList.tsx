import { Signer } from "@/types";
import { CopyButton } from "@/components/ui/CopyButton";

export function SignerList({
  signers,
  highlightAddress,
}: {
  signers: Signer[];
  highlightAddress?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300">
        Signers ({signers.length})
      </h3>
      <div className="flex flex-col gap-2">
        {signers.map((signer) => (
          <div
            key={signer.address}
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              signer.address === highlightAddress
                ? "bg-sky-900/30 border border-sky-800"
                : "bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {signer.address === highlightAddress && (
                <span className="text-xs text-sky-400 shrink-0">You</span>
              )}
              <span className="font-mono text-xs text-slate-300 truncate">
                {signer.address}
              </span>
              <CopyButton text={signer.address} />
            </div>
            <span className="ml-4 shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
              w: {signer.weight}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
