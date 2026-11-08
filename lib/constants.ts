import { Network } from "@/types";

export const NETWORK_PASSPHRASES: Record<Network, string> = {
  mainnet: "Public Global Stellar Network ; September 2015",
  testnet: "Test SDF Network ; September 2015",
  futurenet: "Test SDF Future Network ; October 2022",
};

export const HORIZON_URLS: Record<Network, string> = {
  mainnet: "https://horizon.stellar.org",
  testnet: "https://horizon-testnet.stellar.org",
  futurenet: "https://horizon-futurenet.stellar.org",
};

export const SOROBAN_RPC_URLS: Record<Network, string> = {
  mainnet: "https://mainnet.stellar.validationcloud.io/v1/XCSmR1M7X5oRQMFGFqe7bA",
  testnet: "https://soroban-testnet.stellar.org",
  futurenet: "https://rpc-futurenet.stellar.org",
};

export const STELLAR_EXPERT_BASE: Record<Network, string> = {
  mainnet: "https://stellar.expert/explorer/public",
  testnet: "https://stellar.expert/explorer/testnet",
  futurenet: "https://stellar.expert/explorer/futurenet",
};

export const MAX_SIGNERS = 20;
export const MIN_THRESHOLD = 1;
