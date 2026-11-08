import { AccountType } from "@/types";

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return type === "soroban" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-900/50 border border-violet-700 px-2.5 py-0.5 text-xs font-medium text-violet-300">
      ✦ Soroban
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-900/50 border border-sky-700 px-2.5 py-0.5 text-xs font-medium text-sky-300">
      ★ Classic
    </span>
  );
}
