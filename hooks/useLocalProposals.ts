"use client";

import { useState, useEffect, useCallback } from "react";
import { Proposal } from "@/types";

const KEY = "stellar-multisig-local-proposals";

function load(): Proposal[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(proposals: Proposal[]) {
  localStorage.setItem(KEY, JSON.stringify(proposals));
}

export function useLocalProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    setProposals(load());
  }, []);

  const add = useCallback((proposal: Proposal) => {
    setProposals((prev) => {
      const next = [proposal, ...prev];
      save(next);
      return next;
    });
  }, []);

  const update = useCallback((updated: Proposal) => {
    setProposals((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setProposals((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { proposals, add, update, remove };
}
