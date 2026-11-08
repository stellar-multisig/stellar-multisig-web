"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { createProposal } from "@/lib/api";
import { isValidXdr } from "@/lib/xdr";
import { Network } from "@/types";
import { XdrDecoder } from "./XdrDecoder";
import { Spinner } from "@/components/ui/Spinner";
import {
  Transaction,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
  Account,
} from "@stellar/stellar-sdk";

type Mode = "paste" | "payment";

export function CreateProposalForm({
  accountAddress,
  network,
}: {
  accountAddress: string;
  network: Network;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("paste");
  const [xdr, setXdr] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState(
    format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm")
  );
  const [decoded, setDecoded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment builder state
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("XLM");

  const buildPaymentXdr = () => {
    try {
      const passphrase =
        network === "mainnet"
          ? Networks.PUBLIC
          : network === "futurenet"
          ? Networks.FUTURENET
          : Networks.TESTNET;

      const account = new Account(accountAddress, "0");
      const payAsset = asset === "XLM" ? Asset.native() : Asset.native();
      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: passphrase,
      })
        .addOperation(
          Operation.payment({
            destination,
            asset: payAsset,
            amount,
          })
        )
        .setTimeout(0)
        .build();

      setXdr(tx.toXDR());
      setDecoded(false);
      setMode("paste");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build transaction");
    }
  };

  const submit = async () => {
    if (!xdr || !decoded) {
      setError("Decode and confirm the transaction before creating a proposal.");
      return;
    }
    if (!isValidXdr(xdr)) {
      setError("Invalid XDR.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const proposal = await createProposal({
        accountAddress,
        xdr,
        description,
        expiresAt: new Date(expiresAt).toISOString(),
        network,
      });
      router.push(`/proposals/${proposal.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {(["paste", "payment"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {m === "paste" ? "Paste XDR" : "Build Payment"}
          </button>
        ))}
      </div>

      {mode === "payment" && (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Destination</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="G…"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-slate-400">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                type="number"
                min="0"
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs text-slate-400">Asset</label>
              <input
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="XLM"
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={buildPaymentXdr}
            className="self-start rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors"
          >
            Build XDR
          </button>
        </div>
      )}

      {mode === "paste" && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Transaction XDR</label>
          <textarea
            value={xdr}
            onChange={(e) => { setXdr(e.target.value); setDecoded(false); }}
            rows={4}
            placeholder="Paste base64-encoded transaction envelope XDR…"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none resize-none"
          />
        </div>
      )}

      {xdr && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-300">Transaction Preview</p>
          <XdrDecoder
            xdr={xdr}
            onAllRisksAcknowledged={() => setDecoded(true)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Description (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this transaction for?"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Expires at</label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={submit}
        disabled={loading || !decoded}
        className="flex items-center gap-2 self-start rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white transition-colors"
      >
        {loading && <Spinner size="sm" />}
        Create Proposal
      </button>

      {!decoded && xdr && (
        <p className="text-xs text-amber-400">
          You must decode and confirm the transaction before creating a proposal.
        </p>
      )}
    </div>
  );
}
