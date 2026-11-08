"use client";

import { useCallback, useEffect, useState } from "react";
import { getProposalsByAccount } from "@/lib/api";
import { Network, Proposal } from "@/types";

export function useProposals(accountAddress: string | null, network: Network) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accountAddress) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProposalsByAccount(accountAddress, network);
      setProposals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [accountAddress, network]);

  useEffect(() => {
    load();
  }, [load]);

  return { proposals, loading, error, reload: load };
}
