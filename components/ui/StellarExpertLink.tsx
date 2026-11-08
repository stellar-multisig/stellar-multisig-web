import { Network } from "@/types";
import { stellarExpertUrl } from "@/lib/stellar";

export function StellarExpertLink({
  txHash,
  network,
}: {
  txHash: string;
  network: Network;
}) {
  return (
    <a
      href={stellarExpertUrl(txHash, network)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 hover:underline transition-colors"
    >
      View on Stellar Expert
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
