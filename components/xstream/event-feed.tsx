import React from "react";
import { XIcon } from "./x-icon";

type Tone = "good" | "warn" | "accent";

interface FeedEvent {
  icon: "cart" | "bolt" | "sparkle" | "fire" | "agents";
  t: string;
  who: string;
  when: string;
  tone: Tone;
}

const CALM_EVENTS: FeedEvent[] = [
  { icon: "cart",    t: "AI closed hoodie bundle · $148", who: "viewer @marisol",       when: "12s", tone: "good"   },
  { icon: "sparkle", t: "Viewer accepted bundle offer",   who: "viewer @diego",          when: "34s", tone: "accent" },
  { icon: "bolt",    t: "Urgency timer triggered checkout",who: "viewer @ana.f",         when: "1m",  tone: "warn"   },
  { icon: "agents",  t: "AI detected high buyer intent",  who: "cluster · 184 viewers", when: "2m",  tone: "accent" },
  { icon: "cart",    t: "AI closed hoodie sale · $84",    who: "viewer @luis",           when: "3m",  tone: "good"   },
];

const VIRAL_EVENTS: FeedEvent[] = [
  { icon: "cart",    t: "AI closed bundle · $148",         who: "viewer @marisol", when: "now", tone: "good"   },
  { icon: "bolt",    t: "Urgency timer triggered checkout", who: "23 viewers",      when: "1s",  tone: "warn"   },
  { icon: "sparkle", t: "Bundle accepted · hoodie + tote", who: "viewer @kim.07",  when: "2s",  tone: "accent" },
  { icon: "cart",    t: "AI closed hoodie sale · $84",     who: "viewer @luis",    when: "2s",  tone: "good"   },
  { icon: "fire",    t: "Engagement spike · +6.4k/min",    who: "TikTok inbound",  when: "4s",  tone: "warn"   },
  { icon: "cart",    t: "AI closed hoodie sale · $84",     who: "viewer @ana.f",   when: "6s",  tone: "good"   },
];

interface EventFeedProps {
  viral: boolean;
}

function toneColor(tone: Tone) {
  if (tone === "good")  return "var(--xs-good)";
  if (tone === "warn")  return "var(--xs-warn)";
  return "var(--xs-accent)";
}

export function EventFeed({ viral }: EventFeedProps) {
  const items = viral ? VIRAL_EVENTS : CALM_EVENTS;

  return (
    <div style={{
      border: "1px solid var(--xs-border-s)", borderRadius: 14,
      background: "var(--xs-surf)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--xs-border-s)",
        display: "flex", alignItems: "center", gap: 9,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--xs-good)", boxShadow: "0 0 6px var(--xs-good)",
        }}/>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>Live events</span>
        <div style={{ flex: 1 }}/>
        <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>
          {viral ? "84/min" : "12/min"}
        </span>
      </div>

      {/* Event rows */}
      <div>
        {items.map((e, i) => {
          const color = toneColor(e.tone);
          return (
            <div key={i} style={{
              padding: "9px 16px", display: "flex", gap: 11, alignItems: "center",
              borderBottom: i < items.length - 1 ? "1px solid var(--xs-border-s)" : "none",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: `color-mix(in oklch, ${color} 14%, var(--xs-surf))`,
                color, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <XIcon name={e.icon} size={13}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, color: "var(--xs-text)", fontWeight: 500,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{e.t}</div>
                <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>{e.who}</div>
              </div>
              <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)", flexShrink: 0 }}>{e.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
