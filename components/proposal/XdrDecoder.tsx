"use client";

import { useState } from "react";
import { decodeXdr, isValidXdr } from "@/lib/xdr";
import { DecodedOperation, DecodedTransaction } from "@/types";

const OP_LABELS: Record<string, string> = {
  payment: "Payment",
  createAccount: "Create Account",
  pathPaymentStrictReceive: "Path Payment (Receive)",
  pathPaymentStrictSend: "Path Payment (Send)",
  manageSellOffer: "Manage Sell Offer",
  manageBuyOffer: "Manage Buy Offer",
  createPassiveSellOffer: "Create Passive Sell Offer",
  setOptions: "Set Options",
  changeTrust: "Change Trust",
  allowTrust: "Allow Trust",
  accountMerge: "Account Merge",
  inflation: "Inflation",
  manageData: "Manage Data",
  bumpSequence: "Bump Sequence",
  createClaimableBalance: "Create Claimable Balance",
  claimClaimableBalance: "Claim Claimable Balance",
  beginSponsoringFutureReserves: "Begin Sponsoring Future Reserves",
  endSponsoringFutureReserves: "End Sponsoring Future Reserves",
  revokeSponsorship: "Revoke Sponsorship",
  clawback: "Clawback",
  clawbackClaimableBalance: "Clawback Claimable Balance",
  setTrustLineFlags: "Set Trust Line Flags",
  liquidityPoolDeposit: "Liquidity Pool Deposit",
  liquidityPoolWithdraw: "Liquidity Pool Withdraw",
  invokeHostFunction: "Invoke Host Function (Soroban)",
  extendFootprintTtl: "Extend Footprint TTL",
  restoreFootprint: "Restore Footprint",
};

function OperationCard({ op, index }: { op: DecodedOperation; index: number }) {
  const [confirmed, setConfirmed] = useState(false);
  const label = OP_LABELS[op.type] ?? op.type;

  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-3 ${
        op.isHighRisk
          ? "border-amber-700 bg-amber-950/30"
          : "border-slate-700 bg-slate-800/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Op {index + 1}</span>
          <span className="text-sm font-semibold text-slate-200">{label}</span>
        </div>
        {op.isHighRisk && (
          <span className="rounded-full bg-amber-900/60 border border-amber-700 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            ⚠ High Risk
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(op.fields).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-500">{key}</span>
            <span className="font-mono text-xs text-slate-300 break-all">{value}</span>
          </div>
        ))}
      </div>

      {op.isHighRisk && !confirmed && (
        <div className="rounded-lg border border-amber-700 bg-amber-950/50 p-3 flex flex-col gap-2">
          <p className="text-xs text-amber-300">
            This operation modifies account settings, signers, or thresholds. Review carefully before signing.
          </p>
          <button
            onClick={() => setConfirmed(true)}
            className="self-start rounded bg-amber-700 hover:bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors"
          >
            I understand the risk
          </button>
        </div>
      )}
      {op.isHighRisk && confirmed && (
        <p className="text-xs text-amber-500">✓ Risk acknowledged</p>
      )}
    </div>
  );
}

function TxMeta({ tx }: { tx: DecodedTransaction }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 grid grid-cols-2 gap-3">
      <div>
        <p className="text-xs text-slate-500">Source Account</p>
        <p className="font-mono text-xs text-slate-300 break-all">{tx.sourceAccount}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Fee</p>
        <p className="text-xs text-slate-300">{tx.fee}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Sequence</p>
        <p className="font-mono text-xs text-slate-300">{tx.sequenceNumber}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Memo</p>
        <p className="text-xs text-slate-300">{tx.memo}</p>
      </div>
      {tx.timeBounds && (
        <>
          <div>
            <p className="text-xs text-slate-500">Valid After</p>
            <p className="text-xs text-slate-300">{tx.timeBounds.minTime}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Valid Before</p>
            <p className="text-xs text-slate-300">{tx.timeBounds.maxTime}</p>
          </div>
        </>
      )}
    </div>
  );
}

export function XdrDecoder({
  xdr,
  onAllRisksAcknowledged,
}: {
  xdr: string;
  onAllRisksAcknowledged?: (decoded: DecodedTransaction) => void;
}) {
  const [decoded, setDecoded] = useState<DecodedTransaction | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [unknownConfirmed, setUnknownConfirmed] = useState(false);

  const decode = () => {
    setDecodeError(null);
    if (!isValidXdr(xdr)) {
      setDecodeError("Invalid XDR — cannot parse this transaction envelope.");
      return;
    }
    try {
      const result = decodeXdr(xdr);
      setDecoded(result);
      const hasNoHighRisk = result.operations.every((op) => !op.isHighRisk);
      if (hasNoHighRisk) onAllRisksAcknowledged?.(result);
    } catch (e) {
      setDecodeError(
        e instanceof Error ? e.message : "Failed to decode transaction."
      );
    }
  };

  if (!decoded) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={decode}
          className="self-start rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors"
        >
          Decode Transaction
        </button>
        {decodeError && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-4">
            <p className="text-sm font-medium text-red-400 mb-1">Decode Failed</p>
            <p className="text-sm text-slate-300">{decodeError}</p>
            <p className="mt-2 text-xs text-slate-400">
              Do not sign a transaction you cannot read. Verify the XDR source before proceeding.
            </p>
          </div>
        )}
      </div>
    );
  }

  const highRiskOps = decoded.operations.filter((op) => op.isHighRisk);
  const hasUnknown = decoded.operations.some((op) => op.type === "unknown");

  return (
    <div className="flex flex-col gap-4">
      <TxMeta tx={decoded} />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-300">
          Operations ({decoded.operations.length})
        </p>
        {decoded.operations.map((op, i) => (
          <OperationCard key={i} op={op} index={i} />
        ))}
      </div>

      {hasUnknown && !unknownConfirmed && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-red-400">Unrecognized Operation</p>
          <p className="text-sm text-slate-300">
            One or more operations could not be decoded. You are signing something
            this app cannot display. Proceed only if you obtained this XDR from a
            trusted source and have verified it externally.
          </p>
          <button
            onClick={() => setUnknownConfirmed(true)}
            className="self-start rounded bg-red-800 hover:bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-colors"
          >
            I have verified this externally — proceed
          </button>
        </div>
      )}

      {onAllRisksAcknowledged && (highRiskOps.length === 0 || unknownConfirmed) && (
        <button
          onClick={() => onAllRisksAcknowledged(decoded)}
          className="self-start rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Confirm — I have read all operations
        </button>
      )}
    </div>
  );
}
