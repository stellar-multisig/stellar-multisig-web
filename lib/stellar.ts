import {
  Horizon,
  SorobanRpc,
  Transaction,
  TransactionEnvelope,
} from "@stellar/stellar-sdk";
import { MultisigAccount, Network, Signer } from "@/types";

const HORIZON: Record<Network, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
  futurenet: "https://horizon-futurenet.stellar.org",
};

const SOROBAN_RPC: Record<Network, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://mainnet.stellar.validationcloud.io/v1/XCSmR1M7X5oRQMFGFqe7bA",
  futurenet: "https://rpc-futurenet.stellar.org",
};

export function horizonServer(network: Network): Horizon.Server {
  return new Horizon.Server(HORIZON[network]);
}

export function sorobanServer(network: Network): SorobanRpc.Server {
  return new SorobanRpc.Server(SOROBAN_RPC[network]);
}

export async function fetchMultisigAccount(
  address: string,
  network: Network
): Promise<MultisigAccount> {
  // Soroban contract addresses start with C
  if (address.startsWith("C")) {
    return fetchSorobanAccount(address, network);
  }
  return fetchClassicAccount(address, network);
}

async function fetchClassicAccount(
  address: string,
  network: Network
): Promise<MultisigAccount> {
  const server = horizonServer(network);
  const account = await server.loadAccount(address);

  const signers: Signer[] = account.signers.map((s) => ({
    address: s.key,
    weight: s.weight,
  }));

  return {
    address,
    type: "classic",
    signers,
    thresholds: {
      low: account.thresholds.low_threshold,
      medium: account.thresholds.med_threshold,
      high: account.thresholds.high_threshold,
    },
  };
}

async function fetchSorobanAccount(
  address: string,
  network: Network
): Promise<MultisigAccount> {
  const server = sorobanServer(network);

  // Call get_signers
  const signersResult = await server.simulateTransaction(
    buildReadCall(address, "get_signers", network)
  );

  // Call get_threshold
  const thresholdResult = await server.simulateTransaction(
    buildReadCall(address, "get_threshold", network)
  );

  let signers: Signer[] = [];
  let threshold = 1;

  if (
    SorobanRpc.Api.isSimulationSuccess(signersResult) &&
    signersResult.result
  ) {
    // Parse Vec<BytesN<32>> — each entry is a 32-byte public key
    try {
      const val = signersResult.result.retval;
      const vec = val.vec();
      if (vec) {
        signers = vec.map((item) => ({
          address: item.bytes().toString("hex"),
          weight: 1,
        }));
      }
    } catch {
      signers = [];
    }
  }

  if (
    SorobanRpc.Api.isSimulationSuccess(thresholdResult) &&
    thresholdResult.result
  ) {
    try {
      threshold = thresholdResult.result.retval.u32();
    } catch {
      threshold = 1;
    }
  }

  return {
    address,
    type: "soroban",
    signers,
    thresholds: { low: threshold, medium: threshold, high: threshold },
    sorobanThreshold: threshold,
  };
}

function buildReadCall(
  contractAddress: string,
  method: string,
  network: Network
): Transaction {
  // Minimal fee-only transaction for simulation
  const { Contract, TransactionBuilder, Account, Networks, nativeToScVal } =
    require("@stellar/stellar-sdk");
  const passphrase =
    network === "mainnet"
      ? Networks.PUBLIC
      : network === "futurenet"
      ? Networks.FUTURENET
      : Networks.TESTNET;

  const account = new Account(contractAddress, "0");
  const contract = new Contract(contractAddress);

  return new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call(method))
    .setTimeout(30)
    .build();
}

export async function submitTransaction(
  xdrBase64: string,
  network: Network
): Promise<string> {
  const server = horizonServer(network);
  const tx = TransactionEnvelope.fromXDR(xdrBase64, "base64");
  const result = await server.submitTransaction(
    new Transaction(tx.toXDR("base64"), getPassphrase(network))
  );
  return result.hash;
}

export function getPassphrase(network: Network): string {
  const { Networks } = require("@stellar/stellar-sdk");
  if (network === "mainnet") return Networks.PUBLIC;
  if (network === "futurenet") return Networks.FUTURENET;
  return Networks.TESTNET;
}

export function stellarExpertUrl(hash: string, network: Network): string {
  const net = network === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/tx/${hash}`;
}
