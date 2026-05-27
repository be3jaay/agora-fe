"use client";

import React from "react";
import { XIcon } from "./x-icon";
import type { LiveRole } from "@/hooks/use-agora-live";

interface BroadcastControlsProps {
  role:         LiveRole;
  isMicMuted:   boolean;
  isCamOff:     boolean;
  viewerCount:  number;
  onToggleMic:  () => void;
  onToggleCam:  () => void;
  onLeave:      () => void;
}

export function BroadcastControls({
  role, isMicMuted, isCamOff, viewerCount, onToggleMic, onToggleCam, onLeave,
}: BroadcastControlsProps) {
  const isHost = role === "host";

  return (
    <div style={{
      position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 8, zIndex: 8,
      padding: "8px 12px", borderRadius: 30,
      background: "rgba(10,14,19,0.72)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 8, borderRight: "1px solid rgba(255,255,255,0.12)" }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--xs-warn)", boxShadow: "0 0 8px var(--xs-warn)",
        }}/>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--xs-warn)", letterSpacing: "0.08em" }}>
          {isHost ? "LIVE" : "WATCHING"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 5, paddingRight: 8, borderRight: "1px solid rgba(255,255,255,0.12)", fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>
        <XIcon name="users" size={12}/>
        <span className="xs-tnum">{viewerCount.toLocaleString()}</span>
      </div>

      {isHost && (
        <>
          <button
            onClick={onToggleMic}
            title={isMicMuted ? "Unmute mic" : "Mute mic"}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isMicMuted ? "rgba(200,80,60,0.25)" : "rgba(255,255,255,0.1)",
              color: isMicMuted ? "#e08060" : "rgba(255,255,255,0.8)",
              transition: "all 160ms",
            }}
          >
            {isMicMuted
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="9" y="3" width="6" height="12" rx="3" opacity="0.4"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
              : <XIcon name="mic" size={14}/>
            }
          </button>

          <button
            onClick={onToggleCam}
            title={isCamOff ? "Enable camera" : "Disable camera"}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isCamOff ? "rgba(200,80,60,0.25)" : "rgba(255,255,255,0.1)",
              color: isCamOff ? "#e08060" : "rgba(255,255,255,0.8)",
              transition: "all 160ms",
            }}
          >
            {isCamOff
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="6" width="13" height="12" rx="2" opacity="0.4"/><path d="M16 10l5-3v10l-5-3z" opacity="0.4"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
              : <XIcon name="video" size={14}/>
            }
          </button>
        </>
      )}

      <button
        onClick={onLeave}
        style={{
          height: 28, paddingInline: 12, borderRadius: 14, border: 0, cursor: "pointer",
          background: isHost ? "rgba(220,60,50,0.8)" : "rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
          display: "flex", alignItems: "center", gap: 6,
          transition: "all 160ms",
        }}
      >
        {isHost ? (
          <>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", opacity: 0.9 }}/>
            End stream
          </>
        ) : (
          <>
            <XIcon name="x" size={11}/>
            Leave
          </>
        )}
      </button>
    </div>
  );
}
