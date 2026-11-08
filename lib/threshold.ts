import { MultisigAccount, SignatureEntry, Signer } from "@/types";

export function weightCollected(
  account: MultisigAccount,
  signatures: SignatureEntry[]
): number {
  const signedAddresses = new Set(signatures.map((s) => s.signerAddress));
  return account.signers
    .filter((s) => signedAddresses.has(s.address))
    .reduce((sum, s) => sum + s.weight, 0);
}

export function thresholdNeeded(account: MultisigAccount): number {
  if (account.type === "soroban") return account.sorobanThreshold ?? 1;
  return account.thresholds.medium;
}

export function isThresholdMet(
  account: MultisigAccount,
  signatures: SignatureEntry[]
): boolean {
  return weightCollected(account, signatures) >= thresholdNeeded(account);
}

export function signerHasSigned(
  signerAddress: string,
  signatures: SignatureEntry[]
): boolean {
  return signatures.some((s) => s.signerAddress === signerAddress);
}

export function progressPercent(
  account: MultisigAccount,
  signatures: SignatureEntry[]
): number {
  const needed = thresholdNeeded(account);
  if (needed === 0) return 100;
  return Math.min(100, Math.round((weightCollected(account, signatures) / needed) * 100));
}

export function missingSigners(
  account: MultisigAccount,
  signatures: SignatureEntry[]
): Signer[] {
  const signedAddresses = new Set(signatures.map((s) => s.signerAddress));
  return account.signers.filter((s) => !signedAddresses.has(s.address));
}
