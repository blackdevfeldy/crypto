import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CryptoPricesContext = createContext(null);

const COIN_IDS = 'realio-network,solana,ripple,ethereum';
const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS}&vs_currencies=usd&include_24hr_change=true`;
const CACHE_KEY = 'crypto_prices_cache';

// Fallback prices (mis à jour régulièrement)
const INITIAL_FALLBACK = {
  "realio-network": { "usd": 1.25,    "usd_24h_change": 1.20 },
  "solana":         { "usd": 148.50,  "usd_24h_change": 2.13 },
  "ripple":         { "usd": 2.28,    "usd_24h_change": -0.45 },
  "ethereum":       { "usd": 2450.00, "usd_24h_change": 1.05 }
};

export function CryptoPricesProvider({ children }) {
  const [prices, setPrices] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) return parsed.data;
      }
    } catch (e) {
      console.error("Failed to read prices from localStorage", e);
    }
    return INITIAL_FALLBACK;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return new Date(JSON.parse(cached).timestamp);
    } catch (e) {}
    return new Date();
  });
  const [isStale, setIsStale] = useState(false);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(COINGECKO_API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Validation : on vérifie qu'on a au moins un actif connu
      if (data.solana || data.ethereum || data.ripple || data['realio-network']) {
        setPrices(data);
        setError(null);
        setIsStale(false);
        const now = new Date();
        setLastUpdated(now);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now.getTime() }));
      } else {
        throw new Error("Réponse API invalide");
      }
    } catch (err) {
      console.error("Impossible de récupérer les prix :", err);
      setError("Impossible de mettre à jour les prix. Données en cache affichées.");
      setIsStale(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // Rafraîchissement toutes les 45 secondes (limite rate-limit CoinGecko public)
    const interval = setInterval(fetchPrices, 45000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <CryptoPricesContext.Provider value={{ prices, loading, error, lastUpdated, isStale, refetch: fetchPrices }}>
      {children}
    </CryptoPricesContext.Provider>
  );
}

export function useCryptoPrices() {
  const context = useContext(CryptoPricesContext);
  if (!context) throw new Error('useCryptoPrices doit être utilisé dans CryptoPricesProvider');
  return context;
}
