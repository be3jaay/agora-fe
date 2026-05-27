import React from "react";
import { XIcon } from "./x-icon";

interface SalesIntelProps {
  viral: boolean;
}

export function SalesIntel({ viral }: SalesIntelProps) {
  const stats = [
    { k: "AI conversions",  v: viral ? "$184,260" : "$48,260", delta: viral ? "+412%" : "+18%",     tone: "good"   },
    { k: "Active convos",   v: viral ? "12,604"   : "2,642",   delta: viral ? "+8,940" : "+412"               },
    { k: "Conv. uplift",    v: "+27%",                          delta: "vs. human-only",             tone: "accent" },
    { k: "Top objection",   v: "Sizing",                        delta: "412 mentions"                            },
  ];

  const sparkPath = viral
    ? "M0 30 L20 26 L40 22 L60 18 L80 12 L100 14 L120 8 L140 4 L160 6 L180 2 L200 0"
    : "M0 30 L20 28 L40 24 L60 26 L80 20 L100 22 L120 18 L140 14 L160 16 L180 10 L200 8";

  function deltaColor(tone?: string) {
    if (tone === "good")   return "var(--xs-good)";
    if (tone === "accent") return "var(--xs-accent)";
    return "var(--xs-text-3)";
  }

  return (
    <div style={{
      border: "1px solid var(--xs-border-s)", borderRadius: 14,
      background: "var(--xs-surf)", padding: 16,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
        <XIcon name="conversions" size={14} style={{ color: "var(--xs-text-2)" }}/>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>Sales intelligence</span>
        <span style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>realtime</span>
      </div>

      {/* 2×2 stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {stats.map(s => (
          <div key={s.k}>
            <div className="xs-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{s.k}</div>
            <div className="xs-tnum" style={{ fontSize: 19, fontWeight: 600, color: "var(--xs-text)", letterSpacing: "-0.015em" }}>
              {s.v}
            </div>
            <div style={{ fontSize: 10.5, marginTop: 2, color: deltaColor(s.tone) }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--xs-border-s)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--xs-text-2)" }}>GMV pace · last 30 min</span>
          <span className="xs-tnum" style={{ fontSize: 11, color: "var(--xs-good)", fontWeight: 500 }}>+$3,840/min</span>
        </div>
        <svg viewBox="0 0 200 40" width="100%" height="40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="xs-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--xs-accent)" stopOpacity="0.3"/>
              <stop offset="1" stopColor="var(--xs-accent)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={sparkPath} stroke="var(--xs-accent)" strokeWidth="1.5" fill="none"/>
          <path d={sparkPath + " L200 40 L0 40 Z"} fill="url(#xs-spark-fill)"/>
        </svg>
      </div>
    </div>
  );
}
