"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMultisigAccount } from "@/lib/stellar";
import { MultisigAccount, Network } from "@/types";

export function useAccount(address: string | null, network: Network) {
  const [account, setAccount] = useState<MultisigAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMultisigAccount(address, network);
      setAccount(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load account"
      );
    } finally {
      setLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    load();
  }, [load]);

  return { account, loading, error, reload: load };
}
