"use client";

import React, { useState } from "react";
import { StreamHeader } from "./stream-header";
import { VideoStage } from "./video-stage";
import { CheckoutFlyout } from "./checkout-flyout";
import { ConnectionPanel } from "./connection-panel";
import { BroadcastControls } from "./broadcast-controls";
import { StreamAnalytics } from "./stream-analytics";
import { useAgoraLive } from "@/hooks/use-agora-live";
import { useLiveDuration } from "@/hooks/use-live-duration";

export type StreamMode = "calm" | "viral" | "checkout";

interface StreamScreenProps {
  defaultMode?: StreamMode;
  theme?: "dark" | "light";
}

export function StreamScreen({ defaultMode = "calm", theme = "dark" }: StreamScreenProps) {
  const [mode, setMode] = useState<StreamMode>(defaultMode);

  const viral    = mode === "viral";
  const checkout = mode === "checkout";

  const agora = useAgoraLive();

  const activeVideoTrack = agora.localVideo ?? agora.remoteVideo ?? null;
  const isLive = agora.state === "live";

  const { durationLabel, progressPct } = useLiveDuration(isLive);

  function toggleViral() { setMode(prev => (prev === "viral" ? "calm" : "viral")); }
  function showCheckout()  { setMode("checkout"); }
  function closeCheckout() { setMode("calm"); }

  return (
    <div
      className={`xs-root${theme === "light" ? " xs-light" : ""}`}
      style={{
        width: "100%", height: "100vh",
        display: "flex", flexDirection: "column",
        background: "var(--xs-bg)", color: "var(--xs-text)",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ── */}
      <StreamHeader
        viral={viral}
        onToggleViral={toggleViral}
        liveViewerCount={isLive ? agora.viewerCount : undefined}
      />

      {/* ── Main body ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* ════════════════════════════════════
            LEFT — livestream (fixed, no scroll)
            Chat overlay lives inside VideoStage
        ════════════════════════════════════ */}
        <div style={{
          flex: 1, minWidth: 0,
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          padding: "16px 8px 16px 16px",
        }}>
          <div style={{ flex: 1, position: "relative", minHeight: 340, display: "flex" }}>
            <VideoStage
              viral={viral}
              theme={theme}
              liveTrack={activeVideoTrack}
              mirrorVideo={agora.role === "host"}
              durationLabel={isLive ? durationLabel : undefined}
              progressPct={isLive ? progressPct : undefined}
            />

            <ConnectionPanel
              state={agora.state}
              error={agora.error}
              channel="temp-agora"
              onJoin={agora.join}
              onLeave={agora.leave}
            />

            {isLive && (
              <BroadcastControls
                role={agora.role}
                isMicMuted={agora.isMicMuted}
                isCamOff={agora.isCamOff}
                viewerCount={agora.viewerCount}
                onToggleMic={agora.toggleMic}
                onToggleCam={agora.toggleCamera}
                onLeave={agora.leave}
              />
            )}
          </div>
        </div>

        {/* ════════════════════════════════════
            RIGHT — analytics (scrollable)
        ════════════════════════════════════ */}
        <div
          className="xs-scroll"
          style={{
            width: 390, flexShrink: 0,
            overflowY: "auto",
            padding: "16px 16px 80px 12px",
            borderLeft: "1px solid var(--xs-border-s)",
          }}
        >
          <StreamAnalytics viral={viral} />
        </div>

        {/* Checkout flyout */}
        {checkout && <CheckoutFlyout onClose={closeCheckout} />}
      </div>

      {/* ── Checkout demo trigger ── */}
      {!checkout && (
        <button
          onClick={showCheckout}
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 30,
            background: "var(--xs-surf)", border: "1px solid var(--xs-border)",
            color: "var(--xs-text-2)", fontSize: 11.5, cursor: "pointer",
            boxShadow: "var(--xs-shadow)", zIndex: 5,
          }}
        >
          <span className="xs-ai-dot" style={{ width: 6, height: 6 }} />
          Simulate checkout flyout
        </button>
      )}
    </div>
  );
}
