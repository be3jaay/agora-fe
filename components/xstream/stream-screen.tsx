"use client";

import React, { useState } from "react";
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
import { useLiveDuration } from "@/hooks/use-live-duration";
import { XIcon } from "./x-icon";
import Link from "next/link";

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

  function toggleViral() {
    setMode(prev => (prev === "viral" ? "calm" : "viral"));
  }
  function showCheckout()  { setMode("checkout"); }
  function closeCheckout() { setMode("calm"); }

  return (
    <div
      className={`xs-root${theme === "light" ? " xs-light" : ""}`}
      style={{
        width: "100%", height: "100vh",
        display: "flex", flexDirection: "column",
        background: "var(--xs-bg)",
        color: "var(--xs-text)",
        overflow: "hidden",
      }}
    >
      <StreamHeader
        viral={viral}
        onToggleViral={toggleViral}
        liveViewerCount={isLive ? agora.viewerCount : undefined}
      />

      <div style={{
        flex: 1, minHeight: 0,
        display: "flex",
        overflow: "hidden",  
      }}>

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

        <div
          className="xs-scroll"
          style={{
            width: 368, flexShrink: 0,
            overflowY: "auto",           // ← only this column scrolls
            display: "flex", flexDirection: "column",
            padding: "16px 16px 80px 8px", // extra bottom padding for the FAB
            gap: 14,
          }}
        >
          <div style={{ height: 420, flexShrink: 0 }}>
            <ChaoticChat viral={viral} />
          </div>

          <VoiceCard   viral={viral} />
          <AiDecisions viral={viral} />
          <SalesIntel  viral={viral} />
          <EventFeed   viral={viral} />
        </div>
      </div>

    </div>
  );
}
