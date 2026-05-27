import React from "react";

interface Decision {
  t: string;
  k: string;
  v: string;
  tone: "warn" | "good" | "accent";
  action: string;
}

const CALM_ITEMS: Decision[] = [
  { t: "now",  k: "Pricing hesitation detected",  v: "viewer @sari_k · cart abandoned 2×",    tone: "warn",   action: "Offered" },
  { t: "8s",   k: "Bundle offer generated",        v: "Hoodie + cap · −12% · 38 sent",         tone: "accent", action: "Live"    },
  { t: "22s",  k: "High purchase intent",          v: "viewer @diego · medium · medium",        tone: "good",   action: "Nudged"  },
  { t: "41s",  k: "Urgency strategy activated",    v: "Stock warning · M sizes only",           tone: "warn",   action: "Live"    },
  { t: "1m",   k: "Cross-sell surfaced",            v: "Linen tee · 2,140 viewers shown",       tone: "accent", action: "Sent"    },
  { t: "2m",   k: "Checkout uplift",               v: "Conversion probability +14%",            tone: "good",   action: "Logged"  },
];

const VIRAL_ITEMS: Decision[] = [
  { t: "now",  k: "Urgency strategy",              v: "Stock-warning sweep · 6,200 viewers",   tone: "warn",   action: "Triggered" },
  { t: "now",  k: "Bundle generated",              v: "Hoodie + tote · −18% for hesitant buyers", tone: "accent", action: "Live"  },
  { t: "2s",   k: "High intent",                   v: "Cluster of 412 viewers · checkout nudge",tone: "good",  action: "Nudged"    },
  { t: "4s",   k: "Pricing hesitation",            v: "PH region · personalised COD offer",    tone: "accent", action: "Sent"      },
  { t: "7s",   k: "Cross-sell",                    v: "Linen tee → repeat hoodie buyers",      tone: "accent", action: "Surfaced"  },
  { t: "12s",  k: "Concierge handoff",             v: "VIP · Iris taking over thread",         tone: "good",   action: "Handed"    },
];

interface AiDecisionsProps {
  viral: boolean;
}

function toneColor(tone: Decision["tone"]) {
  if (tone === "warn")   return "var(--xs-warn)";
  if (tone === "good")   return "var(--xs-good)";
  return "var(--xs-accent)";
}

export function AiDecisions({ viral }: AiDecisionsProps) {
  const items = viral ? VIRAL_ITEMS : CALM_ITEMS;

  return (
    <div style={{
      border: "1px solid var(--xs-border-s)", borderRadius: 14,
      background: "var(--xs-surf)", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--xs-border-s)",
        display: "flex", alignItems: "center", gap: 9,
      }}>
        <span className="xs-ai-dot"/>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>AI decisions</span>
        <span style={{ fontSize: 11, color: "var(--xs-text-3)" }}>autonomous · last 3 min</span>
        <div style={{ flex: 1 }}/>
        <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>
          {viral ? "412" : "84"}/min
        </span>
      </div>

      {/* Decision rows */}
      <div style={{ padding: "4px 0" }}>
        {items.map((d, i) => {
          const color = toneColor(d.tone);
          return (
            <div key={i} style={{
              padding: "10px 16px", display: "flex", gap: 11, alignItems: "flex-start",
              borderBottom: i < items.length - 1 ? "1px solid var(--xs-border-s)" : "none",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%", background: color,
                marginTop: 6, flexShrink: 0, boxShadow: `0 0 8px ${color}`,
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>{d.k}</span>
                  <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>{d.t}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--xs-text-2)", marginTop: 1.5, lineHeight: 1.4 }}>{d.v}</div>
              </div>
              <span style={{
                fontSize: 10, color, fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", flexShrink: 0, marginTop: 3,
              }}>{d.action}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
