"use client";

import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { XIcon } from "./x-icon";
import { XMark } from "./x-mark";
import { useAgoraLive } from "@/hooks/use-agora-live";
import { useLiveDuration } from "@/hooks/use-live-duration";
import type { IRemoteVideoTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";

const LiveVideoTrack = lazy(() =>
  import("./live-video-track").then(m => ({ default: m.LiveVideoTrack }))
);

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
type OrbState = "idle" | "detecting" | "speaking";

const HEARTS = [
  { delay: "0s",   x: 14, color: "#ef6a82" },
  { delay: "1.8s", x: 38, color: "#d97ab1" },
  { delay: "3.3s", x: 24, color: "#ef6a82" },
  { delay: "0.9s", x: 58, color: "#f6a37b" },
  { delay: "2.6s", x: 8,  color: "#d97ab1" },
];

const CHAT_OVERLAY = [
  { u: "jen_m",    c: "May medium?",                color: "#a4c0db" },
  { u: "carlo.r",  c: "COD available?",              color: "#d97ab1" },
  { u: "ph_buyer", c: "Kasya kaya sakin?",           color: "#88a787" },
  { u: "sari_k",   c: "Hm shipping?",                color: "#a4c0db" },
  { u: "miguel.t", c: "Pwede discount?",             color: "#d97ab1" },
  { u: "tina.f",   c: "🔥🔥🔥",                     color: "#c89970" },
  { u: "luis",     c: "Restock medium please 🙏",    color: "#88a787" },
  { u: "anya",     c: "Is the model wearing small?", color: "#d97ab1" },
  { u: "marisol",  c: "Mas mabigat sa fleece?",      color: "#a4c0db" },
];

const WAVEFORM_BARS = Array.from({ length: 22 }, (_, i) =>
  10 + Math.sin(i * 0.8) * 5 + Math.abs(Math.sin(i * 1.4)) * 12
);

const NOVA_TRANSCRIPT = [
  { role: "user" as const, text: "Bagay kaya sakin oversized fit?" },
  { role: "nova" as const, text: "Medium would give the relaxed look the host is wearing — based on your last order in a similar style, you sized up once. I'd recommend staying at Medium here." },
  { role: "user" as const, text: "Yung navy blue, available pa?" },
  { role: "nova" as const, text: "Navy is in stock across all sizes right now. Medium is moving fastest — only 7 left. I've pre-loaded your saved address so checkout takes one tap." },
];

const QUICK_ACTIONS = ["My size?", "COD available?", "Shipping to Cebu?", "Bundle deal?"];

/* ─────────────────────────────────────────────────────────
   Ambient AI Orb
───────────────────────────────────────────────────────── */
function AiOrb({
  state, onClick,
}: { state: OrbState; onClick: () => void }) {
  const isDetecting = state === "detecting";
  const isSpeaking  = state === "speaking";

  return (
    <button
      onClick={onClick}
      aria-label="Open AI assistant"
      style={{
        position: "relative", width: 56, height: 56,
        borderRadius: "50%", border: 0, padding: 0,
        cursor: "pointer", background: "none", flexShrink: 0,
      }}
    >
      {/* Outer ripple ring */}
      <div style={{
        position: "absolute", inset: -8, borderRadius: "50%",
        border: `1.5px solid ${isDetecting ? "rgba(200,153,112,0.5)" : "rgba(122,154,184,0.22)"}`,
        animation: isDetecting
          ? "xs-orb-detect-ring 1.4s ease-out infinite"
          : "xs-orb-idle-ring 4s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Glow bloom */}
      <div style={{
        position: "absolute", inset: -14, borderRadius: "50%",
        background: isDetecting
          ? "radial-gradient(circle, rgba(200,153,112,0.18) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(122,154,184,0.12) 0%, transparent 70%)",
        filter: "blur(6px)",
        transition: "all 600ms ease",
        pointerEvents: "none",
      }} />

      {/* Core orb */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: isSpeaking
          ? "radial-gradient(ellipse at 35% 35%, #d4a574, #c89970 40%, #7a5a3a 80%, #2a1810)"
          : isDetecting
          ? "radial-gradient(ellipse at 35% 35%, #c8a882, #a08060 40%, #4a3422 80%, #1e1208)"
          : "radial-gradient(ellipse at 35% 35%, #a4c0db, #7a9ab8 40%, #3a5578 80%, #1a2532)",
        boxShadow: isSpeaking
          ? "inset 0 1px 1px rgba(255,255,255,0.18), 0 0 20px rgba(200,153,112,0.3)"
          : isDetecting
          ? "inset 0 1px 1px rgba(255,255,255,0.14), 0 0 16px rgba(200,153,112,0.2)"
          : "inset 0 1px 1px rgba(255,255,255,0.1), 0 0 12px rgba(122,154,184,0.15)",
        animation: isSpeaking
          ? "xs-orb-speak 1.8s ease-in-out infinite"
          : isDetecting
          ? "xs-orb-detect 1.2s ease-in-out infinite"
          : "xs-orb-idle 4s ease-in-out infinite",
        transition: "background 800ms ease, box-shadow 600ms ease",
      }}>
        {/* Speaking waveform inside orb */}
        {isSpeaking && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
          }}>
            {[1,2,3,4,3,2,1].map((h, i) => (
              <div key={i} style={{
                width: 2, height: h * 4 + 4, borderRadius: 1,
                background: "rgba(246,242,234,0.7)",
                animation: `xs-wave 0.6s ${i * 0.08}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        )}

        {/* Idle: subtle "N" initial */}
        {!isSpeaking && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
            color: "rgba(246,242,234,0.6)",
          }}>
            N
          </div>
        )}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Assistive card (contextual AI nudge overlaid on video)
───────────────────────────────────────────────────────── */
function AssistiveCard({
  icon, text, action, onAction, delay = "0s",
}: {
  icon: React.ReactNode;
  text: string;
  action?: string;
  onAction?: () => void;
  delay?: string;
}) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "9px 14px",
      background: "rgba(13,18,23,0.78)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24,
      animation: `xs-card-in 380ms ${delay} both cubic-bezier(0.34,1.56,0.64,1)`,
      maxWidth: 340, pointerEvents: "all",
    }}>
      <span style={{ color: "var(--xs-accent-d)", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: "var(--xs-text-2)", lineHeight: 1.35 }}>{text}</span>
      {action && (
        <button
          onClick={onAction}
          style={{
            flexShrink: 0, padding: "4px 10px", borderRadius: 14,
            background: "var(--xs-accent-f)", border: "1px solid var(--xs-accent-s)",
            color: "var(--xs-accent-d)", fontSize: 11.5, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Watch / connection overlay (idle → connecting → live)
───────────────────────────────────────────────────────── */
function WatchOverlay({
  state, error, onWatch,
}: {
  state: "idle" | "fetching" | "connecting" | "live" | "error";
  error: string | null;
  onWatch: () => void;
}) {
  if (state === "live") return null;

  if (state === "fetching" || state === "connecting") {
    return (
      <div style={fullOverlay}>
        <div style={spinnerStyle} />
        <p style={{ fontSize: 13, color: "var(--xs-text-2)", margin: 0 }}>
          {state === "fetching" ? "Loading stream…" : "Joining as viewer…"}
        </p>
        <style>{`@keyframes xs-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={fullOverlay}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(200,80,60,0.15)", border: "1px solid rgba(200,80,60,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#e08060",
        }}>
          <XIcon name="x" size={18} />
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--xs-text)", margin: 0 }}>Could not join stream</p>
        <p style={{ fontSize: 12, color: "var(--xs-text-3)", maxWidth: 240, textAlign: "center", lineHeight: 1.5, margin: 0 }}>
          {error ?? "Check your connection and try again."}
        </p>
        <button className="xs-btn xs-btn-primary" onClick={onWatch}>
          Retry
        </button>
      </div>
    );
  }

  /* idle */
  return (
    <div style={fullOverlay}>
      {/* Gradient backdrop glow */}
      <div style={{
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(122,154,184,0.08) 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />

      <XMark size={48} live={false} style={{ marginBottom: 12 }} />
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--xs-text)", margin: "0 0 4px", letterSpacing: "-0.03em" }}>
        Solstice Hoodie Drop
      </h2>
      <p style={{ fontSize: 13, color: "var(--xs-text-3)", margin: "0 0 6px" }}>
        Maren Studio · episode 14
      </p>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        fontSize: 12, color: "var(--xs-text-2)", marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <XIcon name="users" size={13} style={{ opacity: 0.6 }} />
          <span className="xs-tnum">12,408</span> watching
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--xs-warn)" }} />
          Live now
        </div>
      </div>

      <button
        className="xs-btn xs-btn-primary"
        style={{ padding: "13px 32px", fontSize: 14, fontWeight: 600, borderRadius: 12, gap: 10 }}
        onClick={onWatch}
      >
        <XIcon name="play" size={15} />
        Watch Live
      </button>

      <p style={{ fontSize: 11, color: "var(--xs-text-m)", margin: "18px 0 0", letterSpacing: "0.03em" }}>
        Powered by Agora · low-latency RTC
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Product sidebar (right panel — default state)
───────────────────────────────────────────────────────── */
function ProductSidebar({
  isLive, onOpenAi,
}: { isLive: boolean; onOpenAi: () => void }) {
  const [selectedSize, setSelectedSize] = useState("M");

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14, height: "100%",
      overflowY: "auto", paddingRight: 2,
    }} className="xs-scroll">

      {/* Product card */}
      <div style={{
        borderRadius: 14, border: "1px solid var(--xs-border-s)",
        background: "var(--xs-surf)", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Hero image */}
        <div style={{
          height: 200, position: "relative", overflow: "hidden",
          background: "linear-gradient(145deg, #2a1f17 0%, #3d2a1c 40%, #1a1208 100%)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 40% 30%, rgba(212,165,116,0.35) 0%, transparent 65%)",
          }} />
          <div style={{
            position: "absolute", bottom: 14, left: 14,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <span className="xs-live-badge">LIVE PRICE</span>
            <span style={{
              padding: "3px 8px", borderRadius: 5, fontSize: 10.5, fontWeight: 600,
              background: "rgba(136,167,135,0.2)", border: "1px solid rgba(136,167,135,0.4)",
              color: "var(--xs-good)",
            }}>
              7 left
            </span>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {/* Name + price */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--xs-text-3)", marginBottom: 4 }}>
              Maren Studio
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--xs-text)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Solstice Hoodie
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 5 }}>
              <span className="xs-tnum" style={{ fontSize: 20, fontWeight: 700, color: "var(--xs-text)" }}>$84</span>
              <span className="xs-tnum" style={{ fontSize: 13, color: "var(--xs-text-3)", textDecoration: "line-through" }}>$118</span>
              <span style={{
                padding: "2px 7px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                background: "rgba(200,153,112,0.12)", color: "var(--xs-warn)",
              }}>−29%</span>
            </div>
          </div>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 12, color: "var(--xs-text-3)" }}>
            <div style={{ display: "flex", gap: 2, color: "var(--xs-warn)" }}>
              {"★★★★★".split("").map((s, i) => <span key={i} style={{ fontSize: 11 }}>{s}</span>)}
            </div>
            <span className="xs-tnum">4.9</span>
            <span>· 847 reviews</span>
          </div>

          {/* Size selector */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--xs-text-3)", marginBottom: 7, letterSpacing: "0.06em" }}>
              SIZE —{" "}
              <span style={{ color: "var(--xs-text-2)", fontWeight: 600 }}>{selectedSize}</span>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              {["XS", "S", "M", "L", "XL"].map(s => (
                <button key={s} onClick={() => setSelectedSize(s)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  background: s === selectedSize ? "var(--xs-accent-f)" : "var(--xs-surf-2)",
                  border: s === selectedSize ? "1.5px solid var(--xs-accent)" : "1px solid var(--xs-border-s)",
                  color: s === selectedSize ? "var(--xs-accent-d)" : "var(--xs-text-2)",
                  cursor: "pointer", transition: "all 140ms ease",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div style={{
            padding: "9px 11px", borderRadius: 9, marginBottom: 12,
            background: "rgba(184,121,74,0.08)", border: "1px solid rgba(184,121,74,0.28)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <XIcon name="clock" size={13} style={{ color: "var(--xs-warn)", flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: "var(--xs-text-2)", flex: 1, lineHeight: 1.35 }}>
              <strong style={{ color: "var(--xs-text)" }}>Only 7 left</strong> in {selectedSize} · live offer
            </span>
            <span className="xs-tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--xs-warn)", flexShrink: 0 }}>02:14</span>
          </div>

          {/* Nova tip */}
          <div style={{
            padding: "8px 11px", borderRadius: 9, marginBottom: 14,
            background: "var(--xs-accent-f)", border: "1px solid var(--xs-accent-s)",
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          }} onClick={onOpenAi}>
            <span className="xs-ai-dot" style={{ width: 7, height: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: "var(--xs-text-2)", flex: 1, lineHeight: 1.35 }}>
              Nova: <span style={{ color: "var(--xs-accent-d)" }}>Medium is trending for this style</span>
            </span>
            <XIcon name="arrow-right" size={12} style={{ color: "var(--xs-accent)", flexShrink: 0 }} />
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="xs-btn xs-btn-primary" style={{
              flex: 1, padding: "12px 0", fontSize: 13.5, fontWeight: 700,
              justifyContent: "center", borderRadius: 10,
            }}>
              <XIcon name="cart" size={15} />
              {isLive ? "Buy Now" : "Add to Cart"}
            </button>
            <button style={{
              width: 46, height: 46, borderRadius: 10, flexShrink: 0,
              background: "var(--xs-surf-2)", border: "1px solid var(--xs-border-s)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#ef6a82",
            }}>
              <XIcon name="heart" size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Bundle suggestion */}
      <div style={{
        padding: "12px 14px", borderRadius: 12,
        border: "1px solid var(--xs-border-s)", background: "var(--xs-surf)",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, color: "var(--xs-text-3)", letterSpacing: "0.08em", marginBottom: 9 }}>
          FREQUENTLY BOUGHT TOGETHER
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          {["Hoodie", "Cap", "Jogger"].map((item, i) => (
            <React.Fragment key={item}>
              {i > 0 && <span style={{ color: "var(--xs-text-3)", fontSize: 12 }}>+</span>}
              <div style={{
                width: 46, height: 46, borderRadius: 8,
                background: `linear-gradient(135deg, ${["#d4a574,#8a5a3a", "#a4b4c4,#5a7a9a", "#a4b494,#5a7a5a"][i]})`,
                flexShrink: 0,
              }} />
            </React.Fragment>
          ))}
          <div style={{ flex: 1, textAlign: "right" }}>
            <div className="xs-tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--xs-text)" }}>$218</div>
            <div style={{ fontSize: 11, color: "var(--xs-good)" }}>Save $34</div>
          </div>
        </div>
        <button className="xs-btn xs-btn-ghost" style={{ width: "100%", marginTop: 10, fontSize: 12, justifyContent: "center" }}>
          Add bundle
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   AI Voice Panel (right panel — AI state)
───────────────────────────────────────────────────────── */
function AiVoicePanel({ onClose }: { onClose: () => void }) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of transcript
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      animation: "xs-panel-in 340ms cubic-bezier(0.34,1.2,0.64,1)",
    }}>
      {/* Panel header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexShrink: 0,
      }}>
        {/* Nova orb (large) */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div className="xs-breath" style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: "1px solid var(--xs-accent)", opacity: 0.35,
            pointerEvents: "none",
          }} />
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "radial-gradient(ellipse at 35% 35%, #c89970, #a07050 40%, #4a3020 80%, #1e1008)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.14), 0 0 20px rgba(200,153,112,0.2)",
            animation: "xs-orb-speak 1.8s ease-in-out infinite",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {[1,2,3,4,3,2,1].map((h, i) => (
                <div key={i} style={{
                  width: 2, height: h * 3 + 3, borderRadius: 1,
                  background: "rgba(246,242,234,0.65)",
                  animation: `xs-wave 0.55s ${i * 0.07}s ease-in-out infinite alternate`,
                }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--xs-text)" }}>Nova</div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--xs-good)" }} />
            Ambient AI sales assistant
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none", border: 0, cursor: "pointer",
            color: "var(--xs-text-3)", padding: 6, borderRadius: 7,
          }}
        >
          <XIcon name="x" size={14} />
        </button>
      </div>

      {/* Waveform */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 3, height: 32, marginBottom: 14, flexShrink: 0,
      }}>
        {WAVEFORM_BARS.map((h, i) => (
          <div key={i} style={{
            width: 3, height: h * 0.7 + 4, borderRadius: 2,
            background: "linear-gradient(to top, var(--xs-warn), var(--xs-accent-d))",
            opacity: 0.7,
            animation: `xs-wave 0.9s ${i * 0.035}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      {/* Transcript */}
      <div
        ref={transcriptRef}
        className="xs-scroll"
        style={{
          flex: 1, minHeight: 0, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 12,
          marginBottom: 14,
        }}
      >
        {NOVA_TRANSCRIPT.map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            animation: `xs-card-in 300ms ${i * 80}ms both`,
          }}>
            <span style={{
              fontSize: 9.5, letterSpacing: "0.1em", fontWeight: 600,
              color: line.role === "nova" ? "var(--xs-accent)" : "var(--xs-text-3)",
              marginTop: 3, flexShrink: 0, width: 36,
            }}>
              {line.role === "nova" ? "NOVA" : "YOU"}
            </span>
            <div style={{
              flex: 1, fontSize: 13, lineHeight: 1.5,
              color: line.role === "nova" ? "var(--xs-text)" : "var(--xs-text-2)",
              fontStyle: line.role === "nova" ? "italic" : "normal",
              fontFamily: line.role === "nova" ? "'Instrument Serif', serif" : "inherit",
            }} className={line.role === "nova" ? "xs-serif" : ""}>
              "{line.text}"
            </div>
          </div>
        ))}

        {/* Nova is typing */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 9.5, color: "var(--xs-accent)", fontWeight: 600, width: 36, letterSpacing: "0.1em" }}>NOVA</span>
          <div style={{ display: "flex", gap: 4, padding: "5px 8px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "var(--xs-accent)",
                animation: `xs-pulse 1.4s ${i * 0.25}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick action chips */}
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "var(--xs-text-3)", letterSpacing: "0.08em", marginBottom: 7 }}>
          QUICK QUESTIONS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_ACTIONS.map(q => (
            <button key={q} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
              background: "var(--xs-surf-2)", border: "1px solid var(--xs-border-s)",
              color: "var(--xs-text-2)", cursor: "pointer",
              transition: "all 140ms ease",
            }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0, marginBottom: 12,
        display: "flex", gap: 8, alignItems: "center",
        padding: "8px 12px", borderRadius: 10,
        background: "var(--xs-surf-2)", border: "1px solid var(--xs-border-s)",
      }}>
        <span className="xs-ai-dot" style={{ width: 7, height: 7, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12.5, color: "var(--xs-text-3)" }}>Ask Nova anything…</span>
        <XIcon name="mic" size={14} style={{ color: "var(--xs-text-3)" }} />
      </div>

      {/* Checkout CTA */}
      <button className="xs-btn xs-btn-primary" style={{
        flexShrink: 0, width: "100%", padding: "13px 0",
        fontSize: 13.5, fontWeight: 700, justifyContent: "center",
        borderRadius: 10,
        boxShadow: "0 0 24px rgba(164,192,219,0.15)",
      }}>
        <XIcon name="cart" size={15} />
        Complete purchase · $84
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main ViewerScreen
───────────────────────────────────────────────────────── */
export function ViewerScreen() {
  const agora  = useAgoraLive();
  const isLive = agora.state === "live";
  const { durationLabel } = useLiveDuration(isLive);

  const [aiOpen,    setAiOpen]    = useState(false);
  const [orbState,  setOrbState]  = useState<OrbState>("idle");
  const [card1, setCard1] = useState(false);
  const [card2, setCard2] = useState(false);

  const videoTrack = (agora.remoteVideo ?? agora.localVideo) as
    ICameraVideoTrack | IRemoteVideoTrack | null;

  // Simulate ambient AI detection lifecycle
  useEffect(() => {
    const t1 = setTimeout(() => setOrbState("detecting"),            3200);
    const t2 = setTimeout(() => { setCard1(true); },                 4000);
    const t3 = setTimeout(() => setOrbState("idle"),                 5600);
    const t4 = setTimeout(() => setOrbState("detecting"),            9000);
    const t5 = setTimeout(() => { setCard2(true); setOrbState("idle"); }, 10200);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  // Orb becomes "speaking" when AI panel is open
  useEffect(() => {
    setOrbState(aiOpen ? "speaking" : "idle");
  }, [aiOpen]);

  function handleWatch() { void agora.join("audience"); }

  return (
    <div className="xs-root" style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: "var(--xs-bg)", color: "var(--xs-text)",
      overflow: "hidden",
    }}>

      {/* ════════════════════════ TOP BAR ════════════════════════ */}
      <div style={{
        height: 52, padding: "0 20px",
        display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid var(--xs-border-s)",
        background: "var(--xs-bg-el)", flexShrink: 0,
      }}>
        <Link href="/xstream" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 20,
          background: "var(--xs-surf)", border: "1px solid var(--xs-border)",
          color: "var(--xs-text-2)", fontSize: 11.5, textDecoration: "none",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Host Studio
        </Link>

        <span className="xs-live-badge" style={{ fontSize: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#1a0e05" }} />
          LIVE
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--xs-text)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Solstice Hoodie Drop · ep 14
          </div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)", display: "flex", alignItems: "center", gap: 8 }}>
            <span>Maren Studio</span>
            {isLive && (
              <span className="xs-tnum" style={{ color: "var(--xs-accent)" }}>{durationLabel}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--xs-text-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <XIcon name="users" size={13} style={{ opacity: 0.6 }} />
            <span className="xs-tnum">{isLive ? agora.viewerCount.toLocaleString() : "12,408"}</span>
            <span style={{ color: "var(--xs-text-3)" }}>watching</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="xs-ai-dot" style={{ width: 6, height: 6 }} />
            <span style={{ color: "var(--xs-text-3)" }}>AI active</span>
          </div>
        </div>

        {isLive && (
          <button className="xs-btn xs-btn-warn" style={{ fontSize: 11.5, padding: "5px 12px" }}
            onClick={() => void agora.leave()}>
            <XIcon name="x" size={11} /> Leave
          </button>
        )}
        <button className="xs-btn xs-btn-ghost" style={{ fontSize: 11.5 }}>
          <XIcon name="globe" size={13} /> Share
        </button>
      </div>

      {/* ════════════════════════ BODY ════════════════════════ */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* ════════ LEFT — VIDEO (75%) ════════ */}
        <div style={{
          flex: 1, minWidth: 0,
          position: "relative", overflow: "hidden",
          background: videoTrack
            ? "#000"
            : "radial-gradient(ellipse at 28% 38%, #1e2d3e 0%, #0d1217 55%, #060a0e 100%)",
        }}>
          {/* Live video track */}
          {videoTrack && (
            <Suspense fallback={null}>
              <div style={{ position: "absolute", inset: 0 }}>
                <LiveVideoTrack track={videoTrack} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </Suspense>
          )}

          {/* Ambient bloom */}
          <div style={{
            position: "absolute", right: -60, top: -40, width: 300, height: 300,
            borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none",
            background: "radial-gradient(circle, rgba(217,151,76,0.22), transparent 70%)",
          }} />

          {/* ── TOP-LEFT: LIVE badge + timer + viewers ── */}
          <div style={{
            position: "absolute", top: 18, left: 18,
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <span className="xs-live-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a0e05" }} />
              LIVE
            </span>
            {isLive && (
              <span className="xs-tnum" style={{
                padding: "4px 9px", borderRadius: 6,
                background: "rgba(10,14,19,0.6)", backdropFilter: "blur(10px)",
                color: "#f6f2ea", fontSize: 11,
              }}>{durationLabel}</span>
            )}
            <span style={{
              padding: "4px 9px", borderRadius: 6,
              background: "rgba(10,14,19,0.6)", backdropFilter: "blur(10px)",
              color: "#f6f2ea", fontSize: 11,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <XIcon name="users" size={10} />
              <span className="xs-tnum">{isLive ? agora.viewerCount.toLocaleString() : "12,408"}</span>
            </span>
          </div>

          {/* ── TOP-RIGHT: pinned product badge ── */}
          <div style={{
            position: "absolute", top: 18, right: 18, width: 220,
            padding: "10px 12px",
            background: "rgba(10,14,19,0.65)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
            display: "flex", gap: 10, alignItems: "center",
            color: "#f6f2ea",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 7, flexShrink: 0,
              background: "linear-gradient(135deg, #d4a574, #8a5a3a)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 7px)",
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, marginBottom: 1 }}>Pinned</div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Solstice Hoodie</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 2 }}>
                <span className="xs-tnum" style={{ fontSize: 13, fontWeight: 700 }}>$84</span>
                <span className="xs-tnum" style={{ fontSize: 10.5, opacity: 0.45, textDecoration: "line-through" }}>$118</span>
              </div>
            </div>
          </div>

          {/* ── BOTTOM-LEFT: floating chat overlay ── */}
          <div style={{
            position: "absolute", left: 18, bottom: 90, width: 320,
            maxHeight: 190, overflow: "hidden", pointerEvents: "none",
            maskImage: "linear-gradient(to top, white 50%, transparent)",
            WebkitMaskImage: "linear-gradient(to top, white 50%, transparent)",
          }}>
            <div style={{
              display: "flex", flexDirection: "column", gap: 7,
              animation: "xs-chatscroll-calm 18s linear infinite",
            }}>
              {[...CHAT_OVERLAY, ...CHAT_OVERLAY].map((m, i) => (
                <div key={i} style={{
                  display: "inline-flex", gap: 7, alignItems: "baseline",
                  padding: "3px 10px", borderRadius: 7, alignSelf: "flex-start",
                  background: "rgba(10,14,19,0.55)", backdropFilter: "blur(8px)",
                  fontSize: 12, color: "#f6f2ea",
                }}>
                  <span style={{ color: m.color, fontWeight: 500 }}>{m.u}</span>
                  <span style={{ opacity: 0.9 }}>{m.c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM-RIGHT: AI orb + assistive cards ── */}
          <div style={{
            position: "absolute", right: 18, bottom: 70,
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
            pointerEvents: "none",
          }}>
            {/* Assistive card 2 */}
            {card2 && (
              <div style={{ pointerEvents: "all" }}>
                <AssistiveCard
                  icon={<XIcon name="users" size={13} />}
                  text="Most buyers selected Medium for this style"
                  action="See why"
                  onAction={() => setAiOpen(true)}
                  delay="0s"
                />
              </div>
            )}
            {/* Assistive card 1 */}
            {card1 && (
              <div style={{ pointerEvents: "all" }}>
                <AssistiveCard
                  icon={<XIcon name="sparkle" size={13} />}
                  text="Need help choosing the right fit?"
                  action="Ask Nova"
                  onAction={() => setAiOpen(true)}
                  delay="0s"
                />
              </div>
            )}
            {/* Urgency card — always visible */}
            <AssistiveCard
              icon={<XIcon name="clock" size={13} />}
              text="Only 7 left in Medium · 02:14 remaining"
              delay="0.2s"
            />
            {/* Orb */}
            <div style={{ pointerEvents: "all" }}>
              <AiOrb state={orbState} onClick={() => setAiOpen(v => !v)} />
            </div>
          </div>

          {/* ── BOTTOM: hearts ── */}
          <div style={{ position: "absolute", left: 22, bottom: 90, width: 80, height: 200, pointerEvents: "none" }}>
            {HEARTS.map((h, i) => (
              <div key={i} style={{
                position: "absolute", left: h.x, bottom: 0,
                color: h.color, fontSize: 20, opacity: 0,
                animation: `xs-float 4.8s ${h.delay} ease-out infinite`,
              }}>♥</div>
            ))}
          </div>

          {/* ── BOTTOM: player bar ── */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 18px",
            background: "linear-gradient(to top, rgba(10,14,19,0.9), transparent)",
            display: "flex", alignItems: "center", gap: 12, color: "#f6f2ea",
          }}>
            <XIcon name="pause" size={17} />
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.16)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100%", background: "var(--xs-warn)", borderRadius: 2 }} />
              <div style={{ position: "absolute", right: 0, top: -3, width: 9, height: 9, borderRadius: "50%", background: "#f6f2ea" }} />
            </div>
            <span className="xs-tnum" style={{ fontSize: 11, opacity: 0.75 }}>
              {isLive ? durationLabel : "00:00:00"} · LIVE
            </span>
            <XIcon name="more" size={15} style={{ opacity: 0.65 }} />
          </div>

          {/* Connection overlay */}
          <WatchOverlay state={agora.state} error={agora.error} onWatch={handleWatch} />
        </div>

        {/* ════════ RIGHT PANEL (25%) ════════ */}
        <div style={{
          width: 360, flexShrink: 0,
          display: "flex", flexDirection: "column",
          padding: "16px 16px 16px 12px",
          borderLeft: "1px solid var(--xs-border-s)",
          overflow: "hidden",
        }}>
          {aiOpen
            ? <AiVoicePanel onClose={() => setAiOpen(false)} />
            : <ProductSidebar isLive={isLive} onOpenAi={() => setAiOpen(true)} />
          }
        </div>
      </div>

      {/* ════════ KEYFRAMES ════════ */}
      <style>{`
        @keyframes xs-orb-idle {
          0%, 100% { transform: scale(1);    box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 0 12px rgba(122,154,184,0.15); }
          50%       { transform: scale(1.06); box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 0 22px rgba(122,154,184,0.28); }
        }
        @keyframes xs-orb-detect {
          0%, 100% { transform: scale(1);    box-shadow: inset 0 1px 1px rgba(255,255,255,0.14), 0 0 12px rgba(200,153,112,0.18); }
          50%       { transform: scale(1.12); box-shadow: inset 0 1px 1px rgba(255,255,255,0.14), 0 0 28px rgba(200,153,112,0.38); }
        }
        @keyframes xs-orb-speak {
          0%, 100% { transform: scale(1);    box-shadow: inset 0 1px 1px rgba(255,255,255,0.18), 0 0 20px rgba(200,153,112,0.3); }
          50%       { transform: scale(1.08); box-shadow: inset 0 1px 1px rgba(255,255,255,0.18), 0 0 32px rgba(200,153,112,0.5); }
        }
        @keyframes xs-orb-idle-ring {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50%       { opacity: 0.5;  transform: scale(1.08); }
        }
        @keyframes xs-orb-detect-ring {
          0%   { opacity: 0.5;  transform: scale(1);    }
          50%  { opacity: 0.0;  transform: scale(1.6);  }
          100% { opacity: 0.5;  transform: scale(1);    }
        }
        @keyframes xs-card-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes xs-panel-in {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}

/* ─── Shared style objects ─── */
const fullOverlay: React.CSSProperties = {
  position: "absolute", inset: 0, zIndex: 20,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  background: "rgba(10,14,19,0.88)", backdropFilter: "blur(18px)",
  gap: 12,
};

const spinnerStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%",
  border: "2px solid var(--xs-border)",
  borderTop: "2px solid var(--xs-accent)",
  animation: "xs-spin 0.9s linear infinite",
};
