import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Stale-while-revalidate cache:
 * - načte cached data hned z localStorage
 * - stáhne fresh data a pokud se liší, updatuje state + cache
 * - periodicky refreshuje každé intervalMs
 */
export function useCachedRacerList({
  cacheKey = "racerListCache:v1",
  fetchRacers, // async () => array
  intervalMs = 120000, // 2 min
  maxAgeMs = 120000, // 2 min (kdy data považujeme za "čerstvá")
}) {
  const [racers, setRacers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);

  const readCache = () => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.data)) return null;
      return parsed; // { data, savedAt, signature }
    } catch {
      return null;
    }
  };

  const writeCache = (data) => {
    const signature = stableSignature(data);
    const payload = {
      data,
      savedAt: Date.now(),
      signature,
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
    return payload;
  };

  // jednoduchý stabilní podpis – pro detekci změny dat
  function stableSignature(data) {
    // počítáme jen relevantní pole; přizpůsob si dle potřeby
    // (zabráníme "falešným změnám" pokud server mění pořadí klíčů apod.)
    const minimal = data.map((r) => ({
      id: r.id ?? null,
      name: r.name ?? "",
      surname: r.surname ?? "",
      club: r.club ?? "",
      glider: r.glider ?? "",
      gliderClass: r.gliderClass ?? "",
      paymentDate: r.paymentDate ?? "",
      imatriculation: r.imatriculation ?? "",
      startCode: r.startCode ?? "",
    }));
    return JSON.stringify(minimal);
  }

  const refresh = async () => {
    if (!fetchRacers || inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const fresh = await fetchRacers();
      if (!Array.isArray(fresh)) return;

      const freshSig = stableSignature(fresh);
      const cached = readCache();

      // update jen pokud se liší
      if (!cached || cached.signature !== freshSig) {
        const written = writeCache(fresh);
        setRacers(written.data);
        setLastUpdated(new Date(written.savedAt));
      } else {
        // data stejná -> jen aktualizuj lastUpdated, pokud chceš
        setLastUpdated(new Date(cached.savedAt));
      }
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    // 1) načíst cache hned
    const cached = readCache();
    if (cached) {
      setRacers(cached.data);
      setLastUpdated(new Date(cached.savedAt));

      // pokud cache není stará, můžeš klidně ukázat data a refresh udělat na pozadí
      const age = Date.now() - (cached.savedAt || 0);
      if (age < maxAgeMs) {
        setLoading(false);
      }
    }

    // 2) vždy zkus stáhnout fresh (revalidate)
    refresh();

    // 3) polling každé 2 min
    timerRef.current = setInterval(refresh, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, intervalMs, maxAgeMs, fetchRacers]);

  return { racers, loading, lastUpdated, refresh };
}
