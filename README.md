# Stellar Multisig Web

A Next.js 14 app for coordinating multisig transactions on Stellar. Teams propose transactions, collect signatures from distributed signers, and submit once the threshold is met. Supports both classic Stellar multisig accounts and Soroban smart accounts.

## Sister Repos

- **Contracts**: [stellar-multisig-contracts](https://github.com/stellar-multisig/stellar-multisig-contracts) — Soroban M-of-N account + factory
- **API + Docs**: [stellar-multisig-api-docs](https://github.com/stellar-multisig/stellar-multisig-api-docs)

## Tech Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- `@stellar/stellar-sdk` — XDR decode, transaction building, Horizon REST, Soroban RPC
- `@stellar/freighter-api` — browser wallet: connect, sign, network detection
- `date-fns` — date formatting

## Stellar Integration

### Freighter Wallet (`lib/freighter.ts`)

All signing goes through Freighter — the Stellar browser extension wallet. Private keys never touch the app.

```
User clicks "Sign with Freighter"
        │
        ▼
freighter-api.signTransaction(xdrBase64, { networkPassphrase })
        │
        ▼
Freighter shows decoded transaction to user
        │
        ▼
User approves → returns signedTxXdr
        │
        ▼
App posts signedTxXdr to coordinator API as this signer's signature
```

The app uses three Freighter API calls:

| Call | Purpose |
|---|---|
| `isConnected()` | Detect if Freighter is installed |
| `setAllowed()` + `getPublicKey()` | Connect and get the signer's public key |
| `getNetworkDetails()` | Read which network Freighter is on (mainnet / testnet / futurenet) |
| `signTransaction(xdr, { networkPassphrase })` | Sign a transaction envelope |

Network passphrase is always passed explicitly to prevent cross-network replay:

```typescript
// lib/freighter.ts
const passphrase =
  network === "mainnet"
    ? "Public Global Stellar Network ; September 2015"
    : network === "futurenet"
    ? "Test SDF Future Network ; October 2022"
    : "Test SDF Network ; September 2015";

const result = await signTransaction(xdrBase64, { networkPassphrase: passphrase });
```

### XDR Decode (`lib/xdr.ts`)

Every transaction is decoded from base64 XDR into human-readable operations before signing is enabled. This is the core safety guarantee of the app.

```
Paste XDR
    │
    ▼
xdr.TransactionEnvelope.fromXDR(base64)   ← stellar-sdk XDR parser
    │
    ▼
Extract: source account, fee, sequence, memo, timeBounds
    │
    ▼
For each operation:
    ├── Decode fields (destination, amount, asset, signer key, weight…)
    ├── Convert stroops → XLM  (amount / 10_000_000)
    ├── Resolve asset code + issuer from XDR bytes
    └── Flag as HIGH RISK if: setOptions, accountMerge, revokeSponsorship,
        setTrustLineFlags, clawback, clawbackClaimableBalance
```

High-risk operations require explicit user acknowledgement before the Sign button is enabled. Unrecognized operation types show a hard warning and require a separate confirmation.

Supported operation types decoded to plain language:

| XDR Type | Decoded Fields |
|---|---|
| `payment` | Destination, Asset, Amount |
| `createAccount` | Destination, Starting Balance |
| `pathPaymentStrictReceive` | Destination, Send Asset, Send Max, Dest Asset, Dest Amount |
| `pathPaymentStrictSend` | Destination, Send Asset, Send Amount, Dest Asset, Dest Min |
| `manageSellOffer` / `manageBuyOffer` | Selling, Buying, Amount, Offer ID |
| `setOptions` | Master Weight, Low/Med/High Threshold, Signer Key + Weight |
| `changeTrust` | Asset, Limit |
| `accountMerge` | Merge Into |
| `manageData` | Key, Value (set/deleted) |
| `bumpSequence` | Bump To |
| `invokeHostFunction` | Soroban contract invocation |

### Horizon REST API (`lib/stellar.ts`)

Classic Stellar accounts are loaded via the Horizon REST API:

```typescript
// lib/stellar.ts
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const account = await server.loadAccount(address);

// Returns signers with weights and low/med/high thresholds
const signers = account.signers.map((s) => ({ address: s.key, weight: s.weight }));
const thresholds = {
  low:    account.thresholds.low_threshold,
  medium: account.thresholds.med_threshold,
  high:   account.thresholds.high_threshold,
};
```

Transactions are submitted to Horizon after all signatures are collected:

```typescript
const result = await server.submitTransaction(tx);
// result.hash → linked to Stellar Expert after submission
```

Horizon endpoints used:

| Network | URL |
|---|---|
| Mainnet | `https://horizon.stellar.org` |
| Testnet | `https://horizon-testnet.stellar.org` |
| Futurenet | `https://horizon-futurenet.stellar.org` |

### Soroban RPC (`lib/stellar.ts`)

Soroban smart accounts (addresses starting with `C`) are queried via the Soroban RPC `simulateTransaction` endpoint. The app calls `get_signers` and `get_threshold` on the deployed multisig contract:

```typescript
// lib/stellar.ts
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

// Simulate get_signers() — returns Vec<BytesN<32>>
const signersResult = await server.simulateTransaction(
  buildReadCall(address, "get_signers", network)
);

// Simulate get_threshold() — returns u32
const thresholdResult = await server.simulateTransaction(
  buildReadCall(address, "get_threshold", network)
);
```

The contract being queried is the `multisig-account` Soroban contract from [stellar-multisig-contracts](https://github.com/stellar-multisig/stellar-multisig-contracts). Its `__check_auth` function is invoked by the Soroban host whenever `require_auth()` is called on the contract address.

Soroban RPC endpoints used:

| Network | URL |
|---|---|
| Mainnet | `https://mainnet.stellar.validationcloud.io/v1/…` |
| Testnet | `https://soroban-testnet.stellar.org` |
| Futurenet | `https://rpc-futurenet.stellar.org` |

### Threshold Weight Calculation (`lib/threshold.ts`)

For classic accounts, the medium threshold is used as the signing requirement. For Soroban accounts, the on-chain `threshold` value from `get_threshold()` is used.

```typescript
// lib/threshold.ts
export function weightCollected(account, signatures): number {
  // Sum weights of signers who have signed
  return account.signers
    .filter((s) => signedAddresses.has(s.address))
    .reduce((sum, s) => sum + s.weight, 0);
}

export function thresholdNeeded(account): number {
  if (account.type === "soroban") return account.sorobanThreshold;
  return account.thresholds.medium; // classic: medium threshold
}
```

The UI shows a live progress bar. The Submit button is only enabled when `weightCollected >= thresholdNeeded`. The network is always the final source of truth — the client-side calculation is display only.

### Account Type Detection

The app detects account type from the address prefix:

| Prefix | Type | Data Source |
|---|---|---|
| `G…` | Classic Stellar account | Horizon `loadAccount` |
| `C…` | Soroban contract account | Soroban RPC `simulateTransaction` |

### Network Mismatch Protection

Before signing, the app compares the proposal's network against the network Freighter is currently on. If they differ, a warning is shown and signing is blocked until the user switches networks in Freighter.

### Full Signing Flow

```
1. Connect Freighter → getPublicKey()
        │
2. Load account → Horizon loadAccount (classic) or Soroban RPC (Soroban)
        │
3. Load proposal XDR from coordinator API
        │
4. Decode XDR → stellar-sdk xdr.TransactionEnvelope.fromXDR()
        │
5. User reads every operation in plain language
        │
6. User acknowledges any high-risk operations
        │
7. signTransaction(xdr, { networkPassphrase }) via Freighter
        │
8. POST signedTxXdr + signerAddress to coordinator API
        │
9. When weightCollected >= threshold:
        │
10. submitTransaction(assembledXdr) → Horizon
        │
11. Display tx hash + Stellar Expert link
```

## Security Principle

**You sign what you see.** Every transaction is decoded into plain language before signing is enabled. Operations that change signers or thresholds are flagged as high-risk and require explicit acknowledgement. If a transaction cannot be decoded, a clear warning is shown — never silently presented as safe. Private keys never leave Freighter.

## Project Structure

```
stellar-multisig-web/
├── app/
│   ├── page.tsx                      # Landing
│   ├── accounts/
│   │   ├── page.tsx                  # Accounts I'm a signer on
│   │   ├── lookup/page.tsx           # Enter any account address
│   │   └── [address]/page.tsx        # Account: signers, thresholds, proposals
│   ├── proposals/
│   │   ├── new/page.tsx              # Create a proposal
│   │   └── [id]/page.tsx             # Proposal detail + sign
│   └── layout.tsx
├── components/
│   ├── wallet/
│   │   ├── ConnectButton.tsx         # Freighter connect/disconnect
│   │   ├── NetworkSelector.tsx       # Testnet / Mainnet / Futurenet
│   │   └── WalletContext.tsx         # Shared wallet state provider
│   ├── account/
│   │   ├── SignerList.tsx            # Signers with weights
│   │   ├── ThresholdCard.tsx         # low/med/high or Soroban threshold
│   │   └── AccountTypeBadge.tsx      # Classic vs Soroban
│   ├── proposal/
│   │   ├── ProposalCard.tsx
│   │   ├── CreateProposalForm.tsx    # Paste XDR or build a payment
│   │   ├── XdrDecoder.tsx            # Human-readable ops from XDR
│   │   ├── SignatureProgress.tsx     # weight collected / needed
│   │   ├── SignerStatusList.tsx      # who signed, who hasn't
│   │   ├── SignButton.tsx            # signs via Freighter
│   │   ├── SubmitButton.tsx          # enabled only when threshold met
│   │   ├── ProposalStatusBadge.tsx
│   │   └── ProposalFilters.tsx
│   └── ui/
│       ├── Spinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── CopyButton.tsx
│       ├── NetworkBadge.tsx
│       ├── PageHeader.tsx
│       ├── Footer.tsx
│       └── StellarExpertLink.tsx
├── lib/
│   ├── api.ts          # Coordinator API client
│   ├── constants.ts    # Network passphrases, RPC URLs
│   ├── format.ts       # truncateAddress, formatStroops
│   ├── freighter.ts    # Freighter wallet helpers
│   ├── proposal.ts     # Expiry helpers
│   ├── stellar.ts      # Horizon + Soroban RPC
│   ├── threshold.ts    # Client-side weight calculation
│   └── xdr.ts          # XDR decode helpers
├── hooks/
│   ├── useWallet.ts
│   ├── useAccount.ts
│   ├── useProposals.ts
│   ├── useProposal.ts
│   ├── useNetwork.ts
│   ├── useClipboard.ts
│   └── useLocalProposals.ts
└── types/index.ts
```

## Quick Start

```bash
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_URL to your coordinator API

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Coordinator API base URL |

## Pages

| Route | Description |
|---|---|
| `/` | Landing — what multisig coordination is, 3-step flow |
| `/accounts` | Accounts where your wallet is a signer |
| `/accounts/lookup` | Look up any account by address |
| `/accounts/[address]` | Signers, thresholds, pending/past proposals |
| `/proposals/new` | Create a proposal (paste XDR or build payment) |
| `/proposals/[id]` | Decoded ops, signature progress, sign, submit |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
