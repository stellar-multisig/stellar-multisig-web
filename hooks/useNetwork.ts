"use client";

import { useState, useEffect } from "react";
import { Network } from "@/types";

const KEY = "stellar-multisig-network";

export function useNetwork() {
  const [network, setNetworkState] = useState<Network>("testnet");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Network | null;
    if (stored) setNetworkState(stored);
  }, []);

  const setNetwork = (n: Network) => {
    setNetworkState(n);
    localStorage.setItem(KEY, n);
  };

  return { network, setNetwork };
}
