import {
  isConnected,
  getPublicKey,
  signTransaction,
  setAllowed,
  getNetworkDetails,
} from "@stellar/freighter-api";
import { Network } from "@/types";

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<string> {
  const allowed = await setAllowed();
  if (!allowed.isAllowed) throw new Error("Freighter access denied");
  const pk = await getPublicKey();
  if (pk.error) throw new Error(pk.error);
  return pk.publicKey;
}

export async function getFreighterPublicKey(): Promise<string | null> {
  try {
    const pk = await getPublicKey();
    if (pk.error) return null;
    return pk.publicKey;
  } catch {
    return null;
  }
}

export async function getFreighterNetwork(): Promise<Network> {
  try {
    const details = await getNetworkDetails();
    if (details.error) return "testnet";
    const name = details.networkPassphrase;
    if (name.includes("Public")) return "mainnet";
    if (name.includes("Futurenet")) return "futurenet";
    return "testnet";
  } catch {
    return "testnet";
  }
}

export async function signXdr(
  xdrBase64: string,
  network: Network
): Promise<string> {
  const passphrase =
    network === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : network === "futurenet"
      ? "Test SDF Future Network ; October 2022"
      : "Test SDF Network ; September 2015";

  const result = await signTransaction(xdrBase64, {
    networkPassphrase: passphrase,
  });
  if (result.error) throw new Error(result.error);
  return result.signedTxXdr;
}
