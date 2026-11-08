"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkFreighterInstalled,
  connectFreighter,
  getFreighterNetwork,
  getFreighterPublicKey,
} from "@/lib/freighter";
import { Network, WalletState } from "@/types";

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    network: "testnet",
    connected: false,
  });
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkFreighterInstalled().then(setInstalled);
  }, []);

  useEffect(() => {
    if (!installed) return;
    getFreighterPublicKey().then(async (address) => {
      if (address) {
        const network = await getFreighterNetwork();
        setState({ address, network, connected: true });
      }
    });
  }, [installed]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await connectFreighter();
      const network = await getFreighterNetwork();
      setState({ address, network, connected: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, network: "testnet", connected: false });
  }, []);

  return { ...state, installed, loading, error, connect, disconnect };
}
