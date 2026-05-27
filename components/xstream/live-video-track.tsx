"use client";

import { useEffect, useRef } from "react";
import type { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface LiveVideoTrackProps {
  track: ICameraVideoTrack | IRemoteVideoTrack | null;
  mirror?: boolean;
  style?: React.CSSProperties;
}

/**
 * Attaches an Agora video track to a DOM element.
 * When the track changes, the previous one is stopped and the new one plays.
 */
export function LiveVideoTrack({ track, mirror = false, style }: LiveVideoTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !containerRef.current) return;

    // Clear any previous video before playing
    containerRef.current.innerHTML = "";
    track.play(containerRef.current, { mirror });

    return () => {
      try { track.stop(); } catch { /* noop */ }
    };
  }, [track, mirror]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        ...style,
      }}
    />
  );
}
