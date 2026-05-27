"use client";

import { useState, useEffect, useRef } from "react";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

/** 3-hour window used to compute the progress bar (matches a typical livestream max). */
const MAX_SECONDS = 3 * 60 * 60; // 10 800 s

/**
 * Tracks elapsed time from when `isLive` first becomes true.
 * Returns a formatted `HH:MM:SS` label and a progress percentage (0–100).
 */
export function useLiveDuration(isLive: boolean) {
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLive) {
      // Reset when stream ends / before it starts
      startRef.current = null;
      setElapsed(0);
      return;
    }

    // Record the moment we went live (idempotent — only set once)
    if (startRef.current === null) {
      startRef.current = Date.now();
    }

    const id = setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(id);
  }, [isLive]);

  return {
    durationLabel: formatDuration(elapsed),
    progressPct:   Math.min((elapsed / MAX_SECONDS) * 100, 100),
  };
}
