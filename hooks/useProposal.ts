"use client";

import { useCallback, useEffect, useState } from "react";
import { getProposal } from "@/lib/api";
import { Proposal } from "@/types";

export function useProposal(id: string | null) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProposal(id);
      setProposal(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load proposal");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { proposal, loading, error, reload: load };
}
