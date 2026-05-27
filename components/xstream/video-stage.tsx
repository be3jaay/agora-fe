"use client";

import React, { lazy, Suspense } from "react";
import { XIcon } from "./x-icon";
import type { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

// Lazy-load so it never runs server-side
const LiveVideoTrack = lazy(() =>
  import("./live-video-track").then(m => ({ default: m.LiveVideoTrack }))
);

interface VideoStageProps {
  viral: boolean;
  theme?: "dark" | "light";
  /** When provided, renders the live Agora video in place of the gradient placeholder */
  liveTrack?: ICameraVideoTrack | IRemoteVideoTrack | null;
  /** Mirror the video (local camera) */
  mirrorVideo?: boolean;
  /** Functional elapsed-time label (HH:MM:SS). Falls back to mock value when undefined. */
  durationLabel?: string;
  /** Progress bar fill percentage (0–100). Falls back to mock value when undefined. */
  progressPct?: number;
}

const CHAT_OVERLAY = [
  { u: "jen_m",    c: "May medium?",                  color: "#a4c0db" },
  { u: "carlo.r",  c: "COD available?",               color: "#d97ab1" },
  { u: "ph_buyer", c: "Kasya kaya sakin?",            color: "#88a787" },
  { u: "anonymous",c: "Waterproof?",                  color: "#c89970" },
  { u: "sari_k",   c: "Hm shipping?",                 color: "#a4c0db" },
  { u: "miguel.t", c: "Pwede discount?",              color: "#d97ab1" },
  { u: "tina.f",   c: "Color options?",               color: "#88a787" },
  { u: "luis",     c: "Restock medium please 🙏",    color: "#c89970" },
];

const HEARTS = [
  { delay: "0s",   x: 10, color: "#ef6a82" },
  { delay: "1.4s", x: 38, color: "#d97ab1" },
  { delay: "2.7s", x: 22, color: "#ef6a82" },
  { delay: "0.7s", x: 56, color: "#f6a37b" },
  { delay: "3.4s", x: 8,  color: "#d97ab1" },
];

export function VideoStage({ viral, theme = "dark", liveTrack, mirrorVideo = false, durationLabel, progressPct }: VideoStageProps) {
  const timerLabel = durationLabel ?? "00:00:00";
  const fillPct    = progressPct  ?? 0;
  const fillStr    = `${fillPct}%`;
  const isDark = theme !== "light";
  const bg = isDark
    ? "radial-gradient(ellipse at 30% 40%, #2d3a4c 0%, #11161e 55%, #06090d 100%)"
    : "radial-gradient(ellipse at 30% 40%, #c4cdd9 0%, #8a9aae 60%, #4a5d76 100%)";

  return (
    <div style={{
      position: "relative", borderRadius: 14, overflow: "hidden",
      border: "1px solid var(--xs-border-s)",
      background: liveTrack ? "#000" : bg, flex: 1, minHeight: 340,
      boxShadow: "var(--xs-shadow-lg)",
    }}>
      {/* ── Live Agora video (replaces the gradient when connected) ── */}
      {liveTrack ? (
        <Suspense fallback={null}>
          <div style={{ position: "absolute", inset: 0 }}>
            <LiveVideoTrack track={liveTrack} mirror={mirrorVideo}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Suspense>
      ) : (
        <>
          {/* Film grain overlay */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none",
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            mixBlendMode: "overlay",
          }}/>
          {/* Subject silhouette */}
          <div style={{
            position: "absolute", left: "50%", top: "58%", transform: "translate(-50%, -50%)",
            width: 240, height: 320, filter: "blur(2px)", opacity: 0.85,
            background: isDark
              ? "radial-gradient(ellipse at 50% 20%, #d2b89c 0%, #a08066 30%, #3a2a1e 75%, transparent 100%)"
              : "radial-gradient(ellipse at 50% 20%, #efddc8 0%, #b8957a 30%, #5a4434 75%, transparent 100%)",
          }}/>
          <div style={{
            position: "absolute", left: "50%", top: "62%", transform: "translate(-50%, 0)",
            width: 360, height: 240, filter: "blur(3px)", opacity: 0.7,
            background: isDark ? "#2a1f17" : "#5a4030",
            borderRadius: "60% 60% 30% 30% / 80% 80% 20% 20%",
          }}/>
        </>
      )}

      {/* Amber ambient bloom */}
      <div style={{
        position: "absolute", right: -80, top: -60, width: 280, height: 280,
        borderRadius: "50%", filter: "blur(60px)",
        background: "radial-gradient(circle, rgba(217,151,76,0.35), transparent 70%)",
      }}/>

      {/* TOP-LEFT: live badge + timer + viewers */}
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <span className="xs-live-badge">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a0e05" }}/>
          LIVE
        </span>
        <span className="xs-tnum" style={{
          padding: "4px 9px", borderRadius: 6,
          background: "rgba(10,14,19,0.55)", backdropFilter: "blur(10px)",
          color: "#f6f2ea", fontSize: 11, letterSpacing: "0.04em",
        }}>{timerLabel}</span>
        <span style={{
          padding: "4px 9px", borderRadius: 6,
          background: "rgba(10,14,19,0.55)", backdropFilter: "blur(10px)",
          color: "#f6f2ea", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <XIcon name="users" size={11}/>
          <span className="xs-tnum">{viral ? "84,217" : "12,408"}</span>
        </span>
      </div>

      {/* TOP-RIGHT: pinned product card */}
      <div style={{
        position: "absolute", top: 16, right: 16, width: 248, padding: 12,
        background: "rgba(10,14,19,0.6)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
        color: "#f6f2ea", display: "flex", gap: 10, alignItems: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #d4a574, #8a5a3a)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.06) 8px, rgba(0,0,0,0.06) 9px)",
          }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.65 }}>Pinned</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>Solstice Hoodie</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span className="xs-tnum" style={{ fontSize: 13, fontWeight: 600 }}>$84</span>
            <span className="xs-tnum" style={{ fontSize: 11, opacity: 0.55, textDecoration: "line-through" }}>$118</span>
            <span style={{ fontSize: 10, color: "var(--xs-warn)", fontWeight: 600, marginLeft: 2 }}>−29%</span>
          </div>
        </div>
        <button style={{
          padding: "6px 10px", borderRadius: 7, flexShrink: 0,
          background: "#f6f2ea", color: "#1a2230",
          fontSize: 11, fontWeight: 600, border: 0, cursor: "pointer",
        }}>Buy</button>
      </div>

      {/* MIDDLE-RIGHT: urgency banner */}
      <div style={{
        position: "absolute", top: 132, right: 16, width: 248, padding: "10px 12px",
        background: "rgba(184,121,74,0.16)", border: "1px solid rgba(184,121,74,0.5)",
        backdropFilter: "blur(14px)", borderRadius: 10, color: "#f6f2ea",
        display: "flex", gap: 9, alignItems: "center",
      }}>
        <XIcon name="clock" size={15} style={{ color: "var(--xs-warn)", flexShrink: 0 }}/>
        <div style={{ flex: 1, fontSize: 11.5, lineHeight: 1.35 }}>
          <span style={{ fontWeight: 600 }}>Only 7 left</span> in your preferred size · Medium
        </div>
        <span className="xs-tnum" style={{ fontSize: 11, color: "var(--xs-warn)", fontWeight: 600, flexShrink: 0 }}>02:14</span>
      </div>

      {/* BOTTOM-LEFT: floating hearts */}
      <div style={{ position: "absolute", left: 18, bottom: 60, width: 80, height: 200, pointerEvents: "none" }}>
        {HEARTS.map((h, i) => (
          <div key={i} style={{
            position: "absolute", left: h.x, bottom: 0,
            color: h.color, fontSize: 22, opacity: 0,
            animation: `xs-float 4.6s ${h.delay} ease-out infinite`,
          }}>♥</div>
        ))}
      </div>

      {/* BOTTOM-LEFT: chat overlay (scrolling, TikTok-style) */}
      <div style={{
        position: "absolute", left: 16, bottom: 60, width: 340,
        maxHeight: 220, overflow: "hidden", pointerEvents: "none",
        maskImage: "linear-gradient(to top, white 55%, transparent)",
        WebkitMaskImage: "linear-gradient(to top, white 55%, transparent)",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 7,
          animation: `xs-chatscroll-${viral ? "viral" : "calm"} ${viral ? "9s" : "18s"} linear infinite`,
        }}>
          {[...CHAT_OVERLAY, ...CHAT_OVERLAY].map((m, i) => (
            <div key={i} style={{
              display: "inline-flex", gap: 7, alignItems: "baseline",
              padding: "3px 10px", borderRadius: 7, alignSelf: "flex-start",
              background: "rgba(10,14,19,0.52)", backdropFilter: "blur(8px)",
              fontSize: 12, color: "#f6f2ea",
            }}>
              <span style={{ color: m.color, fontWeight: 500 }}>{m.u}</span>
              <span style={{ opacity: 0.9 }}>{m.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM: player controls bar */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 18px",
        background: "linear-gradient(to top, rgba(10,14,19,0.85), transparent)",
        display: "flex", alignItems: "center", gap: 12, color: "#f6f2ea",
      }}>
        <XIcon name="pause" size={18}/>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.18)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: fillStr, background: "var(--xs-warn)", borderRadius: 2 }}/>
          <div style={{ position: "absolute", left: fillStr, top: -3, width: 9, height: 9, borderRadius: "50%", background: "#f6f2ea" }}/>
        </div>
        <span className="xs-tnum" style={{ fontSize: 11, opacity: 0.8 }}>{timerLabel} · LIVE</span>
        <XIcon name="more" size={16} style={{ opacity: 0.7 }}/>
      </div>
    </div>
  );
}
