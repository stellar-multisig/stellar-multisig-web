import { Network } from "@/types";

const STYLES: Record<Network, string> = {
  mainnet: "bg-green-900/40 border-green-800 text-green-300",
  testnet: "bg-yellow-900/30 border-yellow-800 text-yellow-300",
  futurenet: "bg-purple-900/30 border-purple-800 text-purple-300",
};

export function NetworkBadge({ network }: { network: Network }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STYLES[network]}`}
    >
      {network}
    </span>
  );
}
