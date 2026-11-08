import Link from "next/link";
import { ConnectButton } from "@/components/wallet/ConnectButton";

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-900 text-sm font-bold text-sky-300">
          {number}
        </span>
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center text-center gap-6 py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-800 bg-sky-950/50 px-4 py-1.5 text-xs text-sky-400">
          ✦ Supports Classic &amp; Soroban multisig accounts
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 max-w-2xl leading-tight">
          Coordinate multisig transactions on Stellar
        </h1>
        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
          Propose a transaction, collect signatures from distributed signers,
          and submit once the threshold is met — without ever sharing private keys.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ConnectButton />
          <Link
            href="/accounts/lookup"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
          >
            Look up an account
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-slate-200 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Step
            number="1"
            title="Propose"
            description="Paste a transaction XDR or build a simple payment. The transaction is decoded so every signer can read exactly what they're approving before signing."
          />
          <Step
            number="2"
            title="Sign"
            description="Each signer reviews the decoded operations and signs via Freighter. Signatures are collected off-chain until the threshold is met. Private keys never leave your device."
          />
          <Step
            number="3"
            title="Submit"
            description="Once enough signatures are collected, any signer can submit the assembled transaction to the Stellar network. The result is linked to Stellar Expert."
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-200 text-center">Account types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-sky-800/50 bg-sky-950/20 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 text-lg">★</span>
              <h3 className="font-semibold text-slate-200">Classic Multisig</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stellar's native M-of-N account model using signer weights and
              low/medium/high thresholds. Works with any Stellar account that
              has multiple signers configured via <code className="text-sky-400">set_options</code>.
            </p>
          </div>
          <div className="rounded-xl border border-violet-800/50 bg-violet-950/20 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 text-lg">✦</span>
              <h3 className="font-semibold text-slate-200">Soroban Smart Account</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Custom account contracts that implement <code className="text-violet-400">__check_auth</code> for
              on-chain M-of-N ed25519 verification. Deployed via the{" "}
              <a
                href="https://github.com/stellar-multisig/stellar-multisig-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                multisig-contracts
              </a>{" "}
              factory.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-6 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-amber-300">Security principle</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Every transaction is decoded into plain language before you can sign it.
          Operations that change signers or thresholds are flagged as high-risk and
          require explicit acknowledgement. If a transaction cannot be decoded, you
          will be warned — never silently presented with an unreadable payload.
          Your private key never leaves Freighter.
        </p>
      </section>
    </div>
  );
}
