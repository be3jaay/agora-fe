"use client";

import React from "react";
import { XIcon } from "./x-icon";

interface StreamHeaderProps {
  viral: boolean;
  onToggleViral: () => void;
  /** When provided (Agora live), overrides the mock viewer count in the header */
  liveViewerCount?: number;
}

export function StreamHeader({ viral, onToggleViral, liveViewerCount }: StreamHeaderProps) {
  const viewerDisplay = liveViewerCount !== undefined
    ? liveViewerCount.toLocaleString()
    : viral ? "84,217" : "12,408";

  return (
    <div style={{
      height: 60, padding: "0 22px",
      display: "flex", alignItems: "center", gap: 18,
      borderBottom: "1px solid var(--xs-border-s)",
      background: "var(--xs-bg-el)", flexShrink: 0,
    }}>
      {/* Title block */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="xs-live-badge">
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#1a0e05", boxShadow: "0 0 0 3px rgba(26,14,5,0.18)",
          }}/>
          LIVE
        </span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--xs-text)", letterSpacing: "-0.01em" }}>
            Solstice Hoodie Drop · ep 14
          </div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)", marginTop: 1 }}>
            Maren Studio · streaming for 1h 24m
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: 14, fontSize: 12, color: "var(--xs-text-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <XIcon name="users" size={14} style={{ opacity: 0.7 }}/>
          <span className="xs-tnum">{viewerDisplay}</span>
          {liveViewerCount === undefined && (
            <span style={{ color: "var(--xs-good)", fontSize: 11, fontWeight: 500 }}>
              {viral ? "+6,402/min" : "+184/min"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span className="xs-ai-dot"/>
          <span className="xs-tnum">{viral ? "12,604" : "2,642"}</span>
          <span style={{ color: "var(--xs-text-3)" }}>AI conversations</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <XIcon name="cart" size={14} style={{ opacity: 0.7 }}/>
          <span className="xs-tnum">{viral ? "$184,260" : "$48,260"}</span>
          <span style={{ color: "var(--xs-text-3)" }}>GMV today</span>
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Actions */}
      <button className="xs-btn xs-btn-ghost" style={{ fontSize: 12.5 }}>
        <XIcon name="globe" size={13}/>
        Share stream
      </button>
      <button
        className={`xs-btn ${viral ? "xs-btn-warn" : "xs-btn-primary"}`}
        onClick={onToggleViral}
        style={{ fontSize: 12.5 }}
      >
        <XIcon name="bolt" size={13}/>
        {viral ? "Viral mode active" : "Simulate viral livestream"}
      </button>
    </div>
  );
}
