import { xdr, TransactionEnvelope, Transaction, FeeBumpTransaction } from "@stellar/stellar-sdk";
import { DecodedOperation, DecodedTransaction } from "@/types";

const HIGH_RISK_OPS = new Set([
  "setOptions",
  "accountMerge",
  "revokeSponsorship",
  "setTrustLineFlags",
  "clawback",
  "clawbackClaimableBalance",
]);

function formatAmount(amount: string): string {
  const num = parseInt(amount, 10) / 10_000_000;
  return num.toLocaleString("en-US", { maximumFractionDigits: 7 });
}

function assetToString(asset: xdr.Asset): string {
  if (asset.switch().name === "assetTypeNative") return "XLM";
  const code =
    asset.switch().name === "assetTypeCreditAlphanum4"
      ? asset.alphaNum4().assetCode().toString().replace(/\0/g, "")
      : asset.alphaNum12().assetCode().toString().replace(/\0/g, "");
  const issuer =
    asset.switch().name === "assetTypeCreditAlphanum4"
      ? asset.alphaNum4().issuer().value().toString("hex").slice(0, 8)
      : asset.alphaNum12().issuer().value().toString("hex").slice(0, 8);
  return `${code}:${issuer}…`;
}

function decodeOp(op: xdr.Operation): DecodedOperation {
  const body = op.body();
  const type = body.switch().name;
  const isHighRisk = HIGH_RISK_OPS.has(type);
  const fields: Record<string, string> = {};

  switch (type) {
    case "payment": {
      const p = body.paymentOp();
      fields["Destination"] = p.destination().value().toString("hex");
      fields["Asset"] = assetToString(p.asset());
      fields["Amount"] = formatAmount(p.amount().toString());
      break;
    }
    case "createAccount": {
      const c = body.createAccountOp();
      fields["Destination"] = c.destination().value().toString("hex");
      fields["Starting Balance"] = formatAmount(c.startingBalance().toString());
      break;
    }
    case "pathPaymentStrictReceive": {
      const pp = body.pathPaymentStrictReceiveOp();
      fields["Destination"] = pp.destination().value().toString("hex");
      fields["Send Asset"] = assetToString(pp.sendAsset());
      fields["Send Max"] = formatAmount(pp.sendMax().toString());
      fields["Dest Asset"] = assetToString(pp.destAsset());
      fields["Dest Amount"] = formatAmount(pp.destAmount().toString());
      break;
    }
    case "pathPaymentStrictSend": {
      const pp = body.pathPaymentStrictSendOp();
      fields["Destination"] = pp.destination().value().toString("hex");
      fields["Send Asset"] = assetToString(pp.sendAsset());
      fields["Send Amount"] = formatAmount(pp.sendAmount().toString());
      fields["Dest Asset"] = assetToString(pp.destAsset());
      fields["Dest Min"] = formatAmount(pp.destMin().toString());
      break;
    }
    case "manageSellOffer": {
      const o = body.manageSellOfferOp();
      fields["Selling"] = assetToString(o.selling());
      fields["Buying"] = assetToString(o.buying());
      fields["Amount"] = formatAmount(o.amount().toString());
      fields["Offer ID"] = o.offerId().toString();
      break;
    }
    case "manageBuyOffer": {
      const o = body.manageBuyOfferOp();
      fields["Selling"] = assetToString(o.selling());
      fields["Buying"] = assetToString(o.buying());
      fields["Buy Amount"] = formatAmount(o.buyAmount().toString());
      fields["Offer ID"] = o.offerId().toString();
      break;
    }
    case "setOptions": {
      const s = body.setOptionsOp();
      if (s.inflationDest()) fields["Inflation Dest"] = "set";
      if (s.clearFlags()) fields["Clear Flags"] = s.clearFlags()!.toString();
      if (s.setFlags()) fields["Set Flags"] = s.setFlags()!.toString();
      if (s.masterWeight()) fields["Master Weight"] = s.masterWeight()!.toString();
      if (s.lowThreshold()) fields["Low Threshold"] = s.lowThreshold()!.toString();
      if (s.medThreshold()) fields["Med Threshold"] = s.medThreshold()!.toString();
      if (s.highThreshold()) fields["High Threshold"] = s.highThreshold()!.toString();
      if (s.signer()) {
        const signerKey = s.signer()!.key();
        fields["Signer Key"] = signerKey.value().toString("hex");
        fields["Signer Weight"] = s.signer()!.weight().toString();
      }
      break;
    }
    case "changeTrust": {
      const ct = body.changeTrustOp();
      fields["Asset"] = ct.line().switch().name;
      fields["Limit"] = formatAmount(ct.limit().toString());
      break;
    }
    case "allowTrust": {
      const at = body.allowTrustOp();
      fields["Trustor"] = at.trustor().value().toString("hex");
      fields["Asset Code"] = at.asset().value()?.toString() ?? "";
      fields["Authorize"] = at.authorize().toString();
      break;
    }
    case "accountMerge": {
      fields["Merge Into"] = body.destination().value().toString("hex");
      break;
    }
    case "manageData": {
      const md = body.manageDataOp();
      fields["Key"] = md.dataName().toString();
      fields["Value"] = md.dataValue() ? "set" : "deleted";
      break;
    }
    case "bumpSequence": {
      fields["Bump To"] = body.bumpSequenceOp().bumpTo().toString();
      break;
    }
    case "invokeHostFunction": {
      fields["Function"] = "Soroban contract invocation";
      break;
    }
    default:
      fields["Raw Type"] = type;
  }

  return { type, isHighRisk, fields };
}

export function decodeXdr(xdrBase64: string): DecodedTransaction {
  const envelope = TransactionEnvelope.fromXDR(xdrBase64, "base64");
  const inner = envelope.value();

  let tx: Transaction | FeeBumpTransaction;
  if (inner instanceof Transaction) {
    tx = inner;
  } else if ("innerTransaction" in inner) {
    tx = (inner as FeeBumpTransaction).innerTransaction;
  } else {
    tx = inner as Transaction;
  }

  const transaction = tx as Transaction;

  const memo = (() => {
    const m = transaction.memo;
    if (m.type === "none") return "None";
    if (m.type === "text") return `Text: ${m.value}`;
    if (m.type === "id") return `ID: ${m.value}`;
    if (m.type === "hash") return `Hash: ${(m.value as Buffer).toString("hex").slice(0, 16)}…`;
    return m.type;
  })();

  const timeBounds = transaction.timeBounds
    ? {
        minTime: transaction.timeBounds.minTime
          ? new Date(Number(transaction.timeBounds.minTime) * 1000).toISOString()
          : "none",
        maxTime: transaction.timeBounds.maxTime
          ? new Date(Number(transaction.timeBounds.maxTime) * 1000).toISOString()
          : "none",
      }
    : undefined;

  const rawOps = xdr.TransactionEnvelope.fromXDR(xdrBase64, "base64")
    .value()
    .tx()
    .operations();

  return {
    sourceAccount: transaction.source,
    fee: `${parseInt(transaction.fee) / 10_000_000} XLM`,
    sequenceNumber: transaction.sequence,
    memo,
    timeBounds,
    operations: rawOps.map(decodeOp),
  };
}

export function isValidXdr(xdrBase64: string): boolean {
  try {
    xdr.TransactionEnvelope.fromXDR(xdrBase64, "base64");
    return true;
  } catch {
    return false;
  }
}
