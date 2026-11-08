import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-16 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>✦ Stellar Multisig</span>
          <a
            href="https://github.com/stellar-multisig/stellar-multisig-contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Contracts
          </a>
          <Link href="/accounts/lookup" className="hover:text-slate-300 transition-colors">
            Lookup
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span>Private keys never leave your device</span>
          <span>·</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
