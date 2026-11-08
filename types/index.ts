export type Network = "testnet" | "mainnet" | "futurenet";

export type AccountType = "classic" | "soroban";

export interface Signer {
  address: string;
  weight: number;
}

export interface ClassicThresholds {
  low: number;
  medium: number;
  high: number;
}

export interface MultisigAccount {
  address: string;
  type: AccountType;
  signers: Signer[];
  thresholds: ClassicThresholds;
  sorobanThreshold?: number;
}

export type ProposalStatus = "pending" | "ready" | "submitted" | "expired" | "failed";

export interface SignatureEntry {
  signerAddress: string;
  signature: string;
  signedAt: string;
}

export interface Proposal {
  id: string;
  accountAddress: string;
  accountType: AccountType;
  xdr: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  status: ProposalStatus;
  signatures: SignatureEntry[];
  submittedTxHash?: string;
  network: Network;
}

export interface DecodedOperation {
  type: string;
  isHighRisk: boolean;
  fields: Record<string, string>;
}

export interface DecodedTransaction {
  sourceAccount: string;
  fee: string;
  sequenceNumber: string;
  memo: string;
  operations: DecodedOperation[];
  timeBounds?: { minTime: string; maxTime: string };
}

export interface WalletState {
  address: string | null;
  network: Network;
  connected: boolean;
}

export interface CreateProposalInput {
  accountAddress: string;
  xdr: string;
  description: string;
  expiresAt: string;
  network: Network;
}
