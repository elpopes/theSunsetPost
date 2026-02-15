import { useEffect, useRef } from "react";
import { logEvent } from "../analytics";

export default function useInfoView({
  slot,
  info_id,
  lng,
  path,
  threshold = 0.5,
  minMs = 1000,
}) {
  const ref = useRef(null);
  const firedRef = useRef(false);
  const timerRef = useRef(null);

  // Reset when the tile/route changes
  useEffect(() => {
    firedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [slot, info_id, lng, path]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const inView =
          entry.isIntersecting && entry.intersectionRatio >= threshold;

        if (!inView) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        if (firedRef.current) return;

        timerRef.current = setTimeout(() => {
          if (firedRef.current) return;
          firedRef.current = true;

          logEvent("info_view", { slot, info_id, lng, path });
        }, minMs);
      },
      { threshold: [threshold] },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slot, info_id, lng, path, threshold, minMs]);

  return ref;
}
