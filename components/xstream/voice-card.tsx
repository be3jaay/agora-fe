"use client";

import React from "react";
import { XIcon } from "./x-icon";

interface VoiceCardProps {
  viral: boolean;
}

// Pre-compute bar heights so the component is stable across renders
const BARS = Array.from({ length: 28 }, (_, i) =>
  12 + Math.sin(i * 0.7) * 6 + Math.abs(Math.sin(i * 1.3)) * 14
);

export function VoiceCard({ viral }: VoiceCardProps) {
  return (
    <div style={{
      padding: 16, border: "1px solid var(--xs-border-s)", borderRadius: 14,
      background: "var(--xs-surf)", position: "relative", overflow: "hidden",
    }}>
      {/* Accent bloom */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 180, height: 180,
        borderRadius: "50%", background: "radial-gradient(circle, var(--xs-accent-s), transparent 70%)",
        opacity: 0.6, filter: "blur(20px)", pointerEvents: "none",
      }}/>

      <div style={{ position: "relative" }}>
        {/* Agent header */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--xs-accent-d), var(--xs-accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#f6f2ea", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em",
            }}>N</div>
            <div className="xs-breath" style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              border: "1px solid var(--xs-accent)", opacity: 0.4,
            }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>Nova · live voice</div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--xs-good)", flexShrink: 0 }}/>
              speaking to{" "}
              <span className="xs-tnum" style={{ color: "var(--xs-text-2)" }}>jen_m</span>
              {" · "}4 of{" "}
              <span className="xs-tnum">{viral ? "12,604" : "2,642"}</span>
            </div>
          </div>
          <XIcon name="more" size={14} style={{ color: "var(--xs-text-3)" }}/>
        </div>

        {/* Waveform */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 42, marginBottom: 12 }}>
          {BARS.map((h, i) => (
            <div key={i} style={{
              width: 3, height: h, borderRadius: 2,
              background: "linear-gradient(to top, var(--xs-accent), var(--xs-accent-d))",
              animation: `xs-wave 1.1s ${i * 0.04}s ease-in-out infinite alternate`,
            }}/>
          ))}
        </div>

        {/* Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, color: "var(--xs-text-3)", letterSpacing: "0.06em", marginTop: 2, flexShrink: 0 }}>
              JEN
            </span>
            <div style={{ fontSize: 12.5, color: "var(--xs-text-2)", lineHeight: 1.45 }}>
              &ldquo;Bagay kaya sakin oversized fit?&rdquo;
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, color: "var(--xs-accent)", letterSpacing: "0.06em", marginTop: 2, flexShrink: 0, fontWeight: 600 }}>
              NOVA
            </span>
            <div className="xs-serif" style={{ fontSize: 15, color: "var(--xs-text)", lineHeight: 1.4, fontStyle: "italic" }}>
              &ldquo;Medium would likely give the relaxed fit similar to what the host is wearing — based on your last order.&rdquo;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginTop: 12,
          paddingTop: 12, borderTop: "1px solid var(--xs-border-s)",
          fontSize: 10.5, color: "var(--xs-text-3)",
        }}>
          <XIcon name="mic" size={11}/>
          <span>Listening · interruption-aware</span>
          <span style={{ flex: 1 }}/>
          <span className="xs-tnum">208ms latency</span>
        </div>
      </div>
    </div>
  );
}
