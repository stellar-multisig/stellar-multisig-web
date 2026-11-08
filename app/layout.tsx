import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ConnectButton } from "@/components/wallet/ConnectButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stellar Multisig",
  description: "Propose, collect signatures, and submit multisig transactions on Stellar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-semibold text-slate-100 hover:text-sky-400 transition-colors"
              >
                ✦ Stellar Multisig
              </Link>
              <Link
                href="/accounts"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Accounts
              </Link>
              <Link
                href="/proposals/new"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                New Proposal
              </Link>
            </nav>
            <ConnectButton />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
