"use client";

import React from "react";
import { XMark } from "./x-mark";
import { XIcon } from "./x-icon";
import type { ConnectionState, LiveRole } from "@/hooks/use-agora-live";

interface ConnectionPanelProps {
  state:   ConnectionState;
  error:   string | null;
  channel: string;
  onJoin:  (role: LiveRole) => void;
  onLeave: () => void;
}

export function ConnectionPanel({ state, error, channel, onJoin, onLeave }: ConnectionPanelProps) {
  /* ── Connecting / fetching spinner ── */
  if (state === "connecting" || state === "fetching") {
    return (
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(13,18,23,0.86)", backdropFilter: "blur(12px)",
        gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "2px solid var(--xs-border)",
          borderTop: "2px solid var(--xs-accent)",
          animation: "xs-spin 0.9s linear infinite",
        }}/>
        <div style={{ fontSize: 13, color: "var(--xs-text-2)", letterSpacing: "0.04em" }}>
          {state === "fetching" ? "Loading credentials…" : `Joining ${channel}…`}
        </div>
        <style>{`@keyframes xs-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error state ── */
  if (state === "error") {
    return (
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(13,18,23,0.88)", backdropFilter: "blur(12px)",
        gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(200,80,60,0.15)", border: "1px solid rgba(200,80,60,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#e08060",
        }}>
          <XIcon name="x" size={18}/>
        </div>
        <div style={{ fontSize: 13, color: "var(--xs-text)", fontWeight: 500 }}>Connection failed</div>
        <div style={{ fontSize: 11.5, color: "var(--xs-text-3)", maxWidth: 260, textAlign: "center", lineHeight: 1.5 }}>
          {error ?? "Unknown error. Check your Agora credentials."}
        </div>
        <button className="xs-btn xs-btn-ghost" style={{ marginTop: 4 }} onClick={() => onJoin("host")}>
          Retry
        </button>
      </div>
    );
  }

  /* ── Idle: join panel ── */
  if (state === "idle") {
    return (
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(13,18,23,0.82)", backdropFilter: "blur(16px)",
        gap: 0,
      }}>
        <XMark size={52} live={false} style={{ marginBottom: 16 }}/>
        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--xs-text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          XStream Live
        </div>
        <div style={{ fontSize: 13, color: "var(--xs-text-3)", marginBottom: 28 }}>
          Channel: <span style={{ color: "var(--xs-accent)", fontWeight: 500 }}>{channel}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
          {/* Go Live */}
          <button
            className="xs-btn xs-btn-primary"
            style={{ width: "100%", padding: "12px 18px", fontSize: 13, fontWeight: 600, gap: 10 }}
            onClick={() => onJoin("host")}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#1a0e05", boxShadow: "0 0 0 3px rgba(26,14,5,0.25)",
            }}/>
            Go Live · Broadcast
          </button>

          {/* Watch stream */}
          <button
            className="xs-btn xs-btn-ghost"
            style={{ width: "100%", padding: "12px 18px", fontSize: 13, gap: 10 }}
            onClick={() => onJoin("audience")}
          >
            <XIcon name="video" size={15}/>
            Watch Stream · Audience
          </button>
        </div>

        <div style={{ marginTop: 20, fontSize: 10.5, color: "var(--xs-text-m)", letterSpacing: "0.03em" }}>
          Powered by Agora · low-latency RTC
        </div>
      </div>
    );
  }

  return null; // live state — no overlay
}
