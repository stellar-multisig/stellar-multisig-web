# Stellar Multisig Web

A Next.js 14 app for coordinating multisig transactions on Stellar. Teams propose transactions, collect signatures from distributed signers, and submit once the threshold is met. Supports both classic Stellar multisig accounts and Soroban smart accounts.

## Sister Repos

- **Contracts**: [stellar-multisig-contracts](https://github.com/stellar-multisig/stellar-multisig-contracts) — Soroban M-of-N account + factory
- **API + Docs**: [stellar-multisig-api-docs](https://github.com/stellar-multisig/stellar-multisig-api-docs)

## Tech Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- `@stellar/stellar-sdk` — transaction building, XDR decode, Horizon + Soroban RPC
- `@stellar/freighter-api` — browser wallet signing
- `date-fns` — date formatting

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
│   │   ├── ConnectButton.tsx
│   │   └── NetworkSelector.tsx
│   ├── account/
│   │   ├── SignerList.tsx
│   │   ├── ThresholdCard.tsx
│   │   └── AccountTypeBadge.tsx
│   ├── proposal/
│   │   ├── ProposalCard.tsx
│   │   ├── CreateProposalForm.tsx
│   │   ├── XdrDecoder.tsx
│   │   ├── SignatureProgress.tsx
│   │   ├── SignerStatusList.tsx
│   │   ├── SignButton.tsx
│   │   ├── SubmitButton.tsx
│   │   └── ProposalStatusBadge.tsx
│   └── ui/
│       ├── Spinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       └── CopyButton.tsx
├── lib/
│   ├── api.ts          # Coordinator API client
│   ├── freighter.ts    # Freighter wallet helpers
│   ├── stellar.ts      # Horizon + Soroban RPC
│   ├── threshold.ts    # Client-side weight calculation
│   └── xdr.ts          # XDR decode helpers
├── hooks/
│   ├── useWallet.ts
│   ├── useAccount.ts
│   ├── useProposals.ts
│   └── useProposal.ts
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

## Signing Flow

1. Connect Freighter
2. Navigate to a proposal
3. Decode the transaction — every operation shown in plain language
4. Acknowledge any high-risk operations (signer/threshold changes)
5. Click **Sign with Freighter** — signs via `signTransaction`, posts to API
6. Once threshold is met, **Submit to Network** becomes active
7. After submission, link to Stellar Expert is shown

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
