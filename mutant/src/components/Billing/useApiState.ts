import { useState, useEffect } from "react";

export function useApiState(apiFunc: any, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const result = await apiFunc({ signal: controller.signal });
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled && err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, deps);

  return { data, error, loading, setData };
}
