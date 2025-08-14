import { useEffect } from "react";

export function useAsyncEffect(
  effect: (args: { signal?: AbortSignal }) => Promise<void>,
  deps: any[] = []
) {
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        await effect({ signal: controller.signal });
      } catch (err: any) {
        if (!cancelled && err.name !== "AbortError") {
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, deps);
}
