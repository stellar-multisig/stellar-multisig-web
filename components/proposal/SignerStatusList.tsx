import { format } from "date-fns";
import { MultisigAccount, SignatureEntry } from "@/types";
import { signerHasSigned } from "@/lib/threshold";

export function SignerStatusList({
  account,
  signatures,
  currentAddress,
}: {
  account: MultisigAccount;
  signatures: SignatureEntry[];
  currentAddress?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-slate-300">Signer Status</p>
      {account.signers.map((signer) => {
        const signed = signerHasSigned(signer.address, signatures);
        const entry = signatures.find((s) => s.signerAddress === signer.address);
        const isYou = signer.address === currentAddress;

        return (
          <div
            key={signer.address}
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              signed
                ? "bg-green-950/30 border border-green-800"
                : "bg-slate-800/50 border border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-sm ${signed ? "text-green-400" : "text-slate-500"}`}>
                {signed ? "✓" : "○"}
              </span>
              <span className="font-mono text-xs text-slate-300 truncate">
                {signer.address.slice(0, 8)}…{signer.address.slice(-6)}
              </span>
              {isYou && (
                <span className="text-xs text-sky-400 shrink-0">you</span>
              )}
              <span className="text-xs text-slate-500 shrink-0">w:{signer.weight}</span>
            </div>
            <div className="text-right shrink-0 ml-2">
              {signed && entry ? (
                <span className="text-xs text-slate-500">
                  {format(new Date(entry.signedAt), "MMM d, HH:mm")}
                </span>
              ) : (
                <span className="text-xs text-slate-600">awaiting</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
