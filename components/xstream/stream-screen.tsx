"use client";

import React, { useState } from "react";
import { XSidebar } from "./x-sidebar";
import { StreamHeader } from "./stream-header";
import { VideoStage } from "./video-stage";
import { ChaoticChat } from "./chaotic-chat";
import { VoiceCard } from "./voice-card";
import { AiDecisions } from "./ai-decisions";
import { SalesIntel } from "./sales-intel";
import { EventFeed } from "./event-feed";
import { CheckoutFlyout } from "./checkout-flyout";
import { ConnectionPanel } from "./connection-panel";
import { BroadcastControls } from "./broadcast-controls";
import { useAgoraLive } from "@/hooks/use-agora-live";

export type StreamMode = "calm" | "viral" | "checkout";

interface StreamScreenProps {
  defaultMode?: StreamMode;
  theme?: "dark" | "light";
}

export function StreamScreen({ defaultMode = "calm", theme = "dark" }: StreamScreenProps) {
  const [mode, setMode] = useState<StreamMode>(defaultMode);

  const viral    = mode === "viral";
  const checkout = mode === "checkout";

  /* Agora live state */
  const agora = useAgoraLive();

  /* Active video track: local camera (host) or remote broadcast (audience) */
  const activeVideoTrack = agora.localVideo ?? agora.remoteVideo ?? null;
  const isLive = agora.state === "live";

  function toggleViral() {
    setMode(prev => (prev === "viral" ? "calm" : "viral"));
  }
  function showCheckout() { setMode("checkout"); }
  function closeCheckout() { setMode("calm"); }

  return (
    <div
      className={`xs-root${theme === "light" ? " xs-light" : ""}`}
      style={{
        width: "100%", height: "100%",
        display: "flex",
        background: "var(--xs-bg)",
        color: "var(--xs-text)",
      }}
    >
      <XSidebar active="stream"/>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Header — viewer count upgraded when Agora is live */}
        <StreamHeader
          viral={viral}
          onToggleViral={toggleViral}
          liveViewerCount={isLive ? agora.viewerCount : undefined}
        />

        <div style={{
          flex: 1, minHeight: 0, display: "flex", gap: 16, padding: 16,
          position: "relative", overflow: "hidden",
        }}>
          {/* Left: video stage + chat */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0, overflow: "hidden" }}>

            {/* VideoStage — receives the real Agora track when connected */}
            <div style={{ flex: 1, position: "relative", minHeight: 340, display: "flex" }}>
              <VideoStage
                viral={viral}
                theme={theme}
                liveTrack={activeVideoTrack}
                mirrorVideo={agora.role === "host"}
              />

              {/* Agora connection overlay (idle / connecting / error) */}
              <ConnectionPanel
                state={agora.state}
                error={agora.error}
                channel="temp-agora"
                onJoin={agora.join}
                onLeave={agora.leave}
              />

              {/* Broadcast controls toolbar — only shown when live */}
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

            <ChaoticChat viral={viral}/>
          </div>

          {/* Right: AI orchestration rail */}
          <div
            className="xs-scroll"
            style={{ width: 360, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", flexShrink: 0 }}
          >
            <VoiceCard viral={viral}/>
            <AiDecisions viral={viral}/>
            <SalesIntel viral={viral}/>
            <EventFeed viral={viral}/>
          </div>

          {/* Checkout flyout */}
          {checkout && <CheckoutFlyout onClose={closeCheckout}/>}
        </div>
      </div>

      {/* Checkout demo trigger — only when not in checkout */}
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
          <span className="xs-ai-dot" style={{ width: 6, height: 6 }}/>
          Simulate checkout flyout
        </button>
      )}
    </div>
  );
}
