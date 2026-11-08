# Contributing

## Development Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Architecture

- **`lib/xdr.ts`** — pure decode logic, no React. All operation types mapped to human-readable fields. High-risk ops flagged via `HIGH_RISK_OPS` set.
- **`lib/stellar.ts`** — Horizon and Soroban RPC. Classic accounts via `horizon.loadAccount`, Soroban accounts via `simulateTransaction` calling `get_signers` / `get_threshold`.
- **`lib/freighter.ts`** — thin wrapper over `@stellar/freighter-api`. Never stores keys.
- **`lib/threshold.ts`** — pure functions for weight math. Display only — the network is the source of truth.
- **`lib/api.ts`** — coordinator API client. All proposal state lives server-side.

## Key Constraints

- Never show raw RPC errors to users — catch and translate to friendly messages
- Never enable signing before XDR is decoded and all risks acknowledged
- Never store or log private keys or signatures beyond what's needed for the API call
- `SubmitButton` is disabled until `isThresholdMet()` returns true (client-side estimate)

## Adding a New Operation Type

In `lib/xdr.ts`, add a case to the `decodeOp` switch. Add it to `HIGH_RISK_OPS` if it modifies account security settings. Add a human-readable label to `OP_LABELS` in `XdrDecoder.tsx`.

## Commit Style

```
feat: add X
fix: correct Y
chore: update Z
docs: document W
```
