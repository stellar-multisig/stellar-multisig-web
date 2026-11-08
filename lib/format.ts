export function truncateAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatStroops(stroops: string | number): string {
  const num = typeof stroops === "string" ? parseInt(stroops, 10) : stroops;
  return (num / 10_000_000).toLocaleString("en-US", { maximumFractionDigits: 7 });
}

export function networkLabel(network: string): string {
  if (network === "mainnet") return "Mainnet";
  if (network === "futurenet") return "Futurenet";
  return "Testnet";
}
