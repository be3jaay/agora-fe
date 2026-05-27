"use client";

import React from "react";
import { XIcon } from "./x-icon";

interface ChatMessage {
  u: string;
  c: string;
  t: string;
  reply?: { who: string; text: string };
  super?: number;
}

const MESSAGES: ChatMessage[] = [
  { u: "jen_m",    c: "May medium?",                       t: "0:02" },
  { u: "carlo.r",  c: "COD available?",                    t: "0:02" },
  { u: "ph_buyer", c: "Kasya kaya sakin oversized fit?",   t: "0:01" },
  { u: "anonymous",c: "Waterproof?",                       t: "0:01" },
  { u: "sari_k",   c: "Hm shipping?",                      t: "0:01",
    reply: { who: "Nova ✦", text: "Standard 3–5 days · or Express overnight in Metro Manila." } },
  { u: "miguel.t", c: "Pwede discount?",                   t: "0:01" },
  { u: "tina.f",   c: "🔥🔥🔥",                           t: "now"  },
  { u: "luis",     c: "Restock medium please 🙏",          t: "now"  },
  { u: "rae",      c: "Anong fabric niya?",                t: "now",  super: 5 },
  { u: "kim.07",   c: "Will it ship to Cebu?",             t: "now"  },
  { u: "anya",     c: "Is the model wearing small?",       t: "now"  },
  { u: "diego",    c: "Take my money",                     t: "now"  },
  { u: "marisol",  c: "Mas mabigat ba sa fleece?",         t: "now"  },
  { u: "iv__",     c: "Got mine in green 💚",              t: "now"  },
];

interface ChaoticChatProps {
  viral: boolean;
}

export function ChaoticChat({ viral }: ChaoticChatProps) {
  const scrollDuration = viral ? "8s" : "16s";

  return (
    <div style={{
      flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
      border: "1px solid var(--xs-border-s)", borderRadius: 14,
      background: "var(--xs-surf)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "11px 16px", borderBottom: "1px solid var(--xs-border-s)",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--xs-warn)", boxShadow: "0 0 6px var(--xs-warn)",
          }}/>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>Live chat</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
          <span className="xs-tnum">{viral ? "6,402" : "184"}</span>/min
          {" · "}AI answering{" "}
          <span className="xs-tnum" style={{ color: "var(--xs-accent)" }}>{viral ? "94%" : "82%"}</span>
        </span>
        <div style={{ flex: 1 }}/>
        <span className="xs-eyebrow">Chaotic mode</span>
      </div>

      {/* Scrolling feed */}
      <div className="xs-scroll" style={{
        flex: 1, minHeight: 0, overflow: "hidden", padding: "10px 16px",
        position: "relative",
        maskImage: "linear-gradient(to bottom, transparent, white 8%, white 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, white 8%, white 92%, transparent)",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 9,
          animation: `xs-chatscroll-${viral ? "viral" : "calm"} ${scrollDuration} linear infinite`,
        }}>
          {[...MESSAGES, ...MESSAGES].map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", gap: 9, alignItems: "baseline", fontSize: 12.5, lineHeight: 1.4 }}>
                <span className="xs-tnum" style={{ color: "var(--xs-text-3)", fontSize: 10.5, flexShrink: 0 }}>{m.t}</span>
                <span style={{ color: "var(--xs-accent)", fontWeight: 500 }}>{m.u}</span>
                <span style={{ color: "var(--xs-text)", flex: 1 }}>{m.c}</span>
                {m.super && (
                  <span style={{
                    padding: "1px 6px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                    background: "var(--xs-warn)", color: "#1a0e05", flexShrink: 0,
                  }}>$&nbsp;{m.super}</span>
                )}
              </div>
              {m.reply && (
                <div style={{
                  marginLeft: 36, padding: "7px 11px", borderRadius: 8,
                  background: "var(--xs-accent-f)",
                  borderLeft: "2px solid var(--xs-accent)",
                  fontSize: 12, color: "var(--xs-text-2)", lineHeight: 1.45,
                }}>
                  <span style={{ color: "var(--xs-accent)", fontWeight: 600, marginRight: 6 }}>{m.reply.who}</span>
                  <span>{m.reply.text}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 14px", borderTop: "1px solid var(--xs-border-s)",
        display: "flex", alignItems: "center", gap: 9,
        background: "var(--xs-bg-el)", flexShrink: 0,
      }}>
        <div style={{
          flex: 1, padding: "8px 12px", borderRadius: 8,
          background: "var(--xs-surf-2)", color: "var(--xs-text-3)", fontSize: 12,
        }}>
          Say something · AI will surface to host if needed
        </div>
        <XIcon name="send" size={14} style={{ color: "var(--xs-text-3)", flexShrink: 0 }}/>
      </div>
    </div>
  );
}
