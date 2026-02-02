import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App.js";
import { fetchData } from "../services/connection.js";
import RacerList from "../components/RacerList";

const CACHE_KEY = "racerlist_cache_v1";
const POLL_MS = 120000; // 2 min

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function makeSignature(list) {
  // malý „podpis“ pro porovnání změn (nezávislý na pořadí klíčů)
  return JSON.stringify(
    (list || []).map((r) => ({
      id: r.id ?? null,
      name: r.name ?? "",
      surname: r.surname ?? "",
      club: r.club ?? "",
      glider: r.glider ?? "",
      gliderClass: r.gliderClass ?? "",
      paymentDate: r.paymentDate ?? "",
      imatriculation: r.imatriculation ?? "",
      startCode: r.startCode ?? "",
    }))
  );
}

function readCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const parsed = safeJsonParse(raw);
  if (!parsed || !Array.isArray(parsed.data)) return null;
  return parsed; // { data, savedAt, sig }
}

function writeCache(data) {
  const payload = {
    data,
    savedAt: Date.now(),
    sig: makeSignature(data),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
  return payload;
}

const RacerListPage = () => {
  const app = useContext(AppContext);

  const [racerList, setRacerList] = useState([]);
  const [loading, setLoading] = useState(true);

  const inFlightRef = useRef(false);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!app.apiBaseUrlState) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      const resp = await fetchData("racerlist", "&limit=1000");

      if (resp?.isError) return;

      const fresh = Array.isArray(resp.data) ? resp.data : [];
      const freshSig = makeSignature(fresh);
      const cached = readCache();

      if (!cached || cached.sig !== freshSig) {
        const written = writeCache(fresh);
        setRacerList(written.data);
      } else {
        // stejné -> necháme state, ale klidně můžeme setnout z cache
        setRacerList(cached.data);
      }
    } catch (e) {
      console.error("racerlist refresh error", e);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [app.apiBaseUrlState]);

  useEffect(() => {
    // 1) zobraz cached data hned, pokud existují
    const cached = readCache();
    if (cached) {
      setRacerList(cached.data);
      setLoading(false);
    }

    // 2) revalidate hned
    refresh();

    // 3) polling každé 2 min
    timerRef.current = setInterval(refresh, POLL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh]);

  return <RacerList racerList={racerList} loading={loading} />;
};

export default RacerListPage;
