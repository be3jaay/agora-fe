"use client";

import React, { lazy, Suspense } from "react";
import Link from "next/link";
import { XIcon } from "./x-icon";
import { XMark } from "./x-mark";
import { ChaoticChat } from "./chaotic-chat";
import { useAgoraLive } from "@/hooks/use-agora-live";
import { useLiveDuration } from "@/hooks/use-live-duration";
import type { IRemoteVideoTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";

const LiveVideoTrack = lazy(() =>
  import("./live-video-track").then(m => ({ default: m.LiveVideoTrack }))
);

const HEARTS = [
  { delay: "0s",   x: 12, color: "#ef6a82" },
  { delay: "1.6s", x: 34, color: "#d97ab1" },
  { delay: "3.1s", x: 20, color: "#ef6a82" },
  { delay: "0.8s", x: 52, color: "#f6a37b" },
  { delay: "2.4s", x: 6,  color: "#d97ab1" },
];

/* ─────────────────────────────────────────────────────────
   Viewer connection overlay (audience-only, no host option)
───────────────────────────────────────────────────────── */
function WatchPanel({
  state, error, onWatch, onLeave,
}: {
  state: "idle" | "fetching" | "connecting" | "live" | "error";
  error: string | null;
  onWatch: () => void;
  onLeave: () => void;
}) {
  if (state === "live") return null;

  if (state === "fetching" || state === "connecting") {
    return (
      <div style={overlayStyle}>
        <div style={spinnerStyle} />
        <div style={{ fontSize: 13, color: "var(--xs-text-2)", letterSpacing: "0.04em" }}>
          {state === "fetching" ? "Loading stream…" : "Joining as viewer…"}
        </div>
        <style>{`@keyframes xs-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={overlayStyle}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "rgba(200,80,60,0.15)", border: "1px solid rgba(200,80,60,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#e08060",
        }}>
          <XIcon name="x" size={18} />
        </div>
        <div style={{ fontSize: 13, color: "var(--xs-text)", fontWeight: 500 }}>Could not join stream</div>
        <div style={{ fontSize: 11.5, color: "var(--xs-text-3)", maxWidth: 240, textAlign: "center", lineHeight: 1.5 }}>
          {error ?? "Check your connection and try again."}
        </div>
        <button className="xs-btn xs-btn-primary" style={{ marginTop: 4 }} onClick={onWatch}>
          Retry
        </button>
      </div>
    );
  }

  /* idle */
  return (
    <div style={overlayStyle}>
      <XMark size={52} live={false} style={{ marginBottom: 14 }} />
      <div style={{ fontSize: 20, fontWeight: 600, color: "var(--xs-text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
        Solstice Hoodie Drop
      </div>
      <div style={{ fontSize: 12, color: "var(--xs-text-3)", marginBottom: 24, textAlign: "center", lineHeight: 1.5 }}>
        Maren Studio is live now<br />
        <span style={{ color: "var(--xs-accent)" }}>12,408</span> watching
      </div>

      <button
        className="xs-btn xs-btn-primary"
        style={{ width: 240, padding: "13px 18px", fontSize: 13, fontWeight: 600, gap: 10 }}
        onClick={onWatch}
      >
        <XIcon name="play" size={14} />
        Watch Live
      </button>

      <div style={{ marginTop: 16, fontSize: 10.5, color: "var(--xs-text-m)", letterSpacing: "0.03em" }}>
        Powered by Agora · low-latency RTC
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pinned product card (right rail)
───────────────────────────────────────────────────────── */
function ProductCard({ isLive }: { isLive: boolean }) {
  return (
    <div style={{
      borderRadius: 14, border: "1px solid var(--xs-border-s)",
      background: "var(--xs-surf)", overflow: "hidden", flexShrink: 0,
    }}>
      {/* Product image + info */}
      <div style={{ display: "flex", gap: 12, padding: "14px 14px 10px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #d4a574, #8a5a3a)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.06) 8px, rgba(0,0,0,0.06) 9px)",
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--xs-text-3)", marginBottom: 3 }}>
            Pinned product
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--xs-text)", lineHeight: 1.25 }}>
            Solstice Hoodie
          </div>
          <div style={{ fontSize: 11.5, color: "var(--xs-text-3)", marginTop: 2 }}>
            Available in 4 colours
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 5 }}>
            <span className="xs-tnum" style={{ fontSize: 16, fontWeight: 700, color: "var(--xs-text)" }}>$84</span>
            <span className="xs-tnum" style={{ fontSize: 12, color: "var(--xs-text-3)", textDecoration: "line-through" }}>$118</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--xs-warn)" }}>−29%</span>
          </div>
        </div>
      </div>

      {/* Urgency strip */}
      <div style={{
        margin: "0 14px 12px", padding: "8px 12px",
        background: "rgba(184,121,74,0.10)", border: "1px solid rgba(184,121,74,0.35)",
        borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
      }}>
        <XIcon name="clock" size={13} style={{ color: "var(--xs-warn)", flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, color: "var(--xs-text-2)", flex: 1, lineHeight: 1.35 }}>
          <strong>Only 7 left</strong> in Medium · offer ends in
        </span>
        <span className="xs-tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--xs-warn)" }}>02:14</span>
      </div>

      {/* Size selector */}
      <div style={{ padding: "0 14px 12px", display: "flex", gap: 7 }}>
        {["XS", "S", "M", "L", "XL"].map(s => (
          <button key={s} style={{
            flex: 1, padding: "7px 0", borderRadius: 7, fontSize: 12, fontWeight: 600,
            background: s === "M" ? "var(--xs-accent-f)" : "var(--xs-surf-2)",
            border: s === "M" ? "1px solid var(--xs-accent)" : "1px solid var(--xs-border-s)",
            color: s === "M" ? "var(--xs-accent)" : "var(--xs-text-2)",
            cursor: "pointer",
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 14px 14px", display: "flex", gap: 8 }}>
        <button
          className="xs-btn xs-btn-primary"
          style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 600, justifyContent: "center" }}
        >
          <XIcon name="cart" size={14} />
          {isLive ? "Buy Now · Live Price" : "Add to Cart"}
        </button>
        <button style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: "var(--xs-surf-2)", border: "1px solid var(--xs-border-s)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#ef6a82",
        }}>
          <XIcon name="heart" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main viewer screen
───────────────────────────────────────────────────────── */
export function ViewerScreen() {
  const agora = useAgoraLive();
  const isLive = agora.state === "live";
  const { durationLabel } = useLiveDuration(isLive);

  const videoTrack = (agora.remoteVideo ?? agora.localVideo) as ICameraVideoTrack | IRemoteVideoTrack | null;

  function handleWatch() {
    void agora.join("audience");
  }

  return (
    <div
      className="xs-root"
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        background: "var(--xs-bg)", color: "var(--xs-text)",
        overflow: "hidden",
      }}
    >
      {/* ── Viewer top bar ── */}
      <div style={{
        height: 56, padding: "0 20px",
        display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid var(--xs-border-s)",
        background: "var(--xs-bg-el)", flexShrink: 0,
      }}>
        <Link
          href="/xstream"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 20,
            background: "var(--xs-surf)", border: "1px solid var(--xs-border)",
            color: "var(--xs-text-2)", fontSize: 11.5, textDecoration: "none",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Host Studio
        </Link>

        {/* Live badge */}
        <span className="xs-live-badge">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a0e05" }} />
          LIVE
        </span>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--xs-text)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Solstice Hoodie Drop · ep 14
          </div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
            Maren Studio
            {isLive && (
              <span className="xs-tnum" style={{ marginLeft: 8, color: "var(--xs-accent)" }}>
                {durationLabel}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12, color: "var(--xs-text-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <XIcon name="users" size={13} style={{ opacity: 0.7 }} />
            <span className="xs-tnum">{isLive ? agora.viewerCount : "12,408"}</span>
            <span style={{ color: "var(--xs-text-3)" }}>watching</span>
          </div>
        </div>

        {/* Leave button — only when watching */}
        {isLive && (
          <button
            className="xs-btn xs-btn-warn"
            style={{ fontSize: 12, padding: "6px 14px" }}
            onClick={() => void agora.leave()}
          >
            <XIcon name="x" size={12} />
            Leave
          </button>
        )}

        {/* Share */}
        <button className="xs-btn xs-btn-ghost" style={{ fontSize: 12 }}>
          <XIcon name="globe" size={13} />
          Share
        </button>
      </div>

      {/* ── Main body ── */}
      <div style={{
        flex: 1, minHeight: 0,
        display: "flex",
        overflow: "hidden",
      }}>

        {/* ══════════════════════════════════════════
            LEFT — video (fixed, never scrolls)
        ══════════════════════════════════════════ */}
        <div style={{
          flex: 1, minWidth: 0,
          overflow: "hidden",
          position: "relative",
          background: videoTrack ? "#000"
            : "radial-gradient(ellipse at 30% 40%, #2d3a4c 0%, #11161e 55%, #06090d 100%)",
        }}>

          {/* Live video */}
          {videoTrack && (
            <Suspense fallback={null}>
              <div style={{ position: "absolute", inset: 0 }}>
                <LiveVideoTrack track={videoTrack} style={{ width: "100%", height: "100%" }} />
              </div>
            </Suspense>
          )}

          {/* Ambient bloom */}
          <div style={{
            position: "absolute", right: -80, top: -60, width: 280, height: 280,
            borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
            background: "radial-gradient(circle, rgba(217,151,76,0.28), transparent 70%)",
          }} />

          {/* Floating hearts */}
          <div style={{ position: "absolute", left: 20, bottom: 70, width: 80, height: 200, pointerEvents: "none" }}>
            {HEARTS.map((h, i) => (
              <div key={i} style={{
                position: "absolute", left: h.x, bottom: 0,
                color: h.color, fontSize: 22, opacity: 0,
                animation: `xs-float 4.6s ${h.delay} ease-out infinite`,
              }}>♥</div>
            ))}
          </div>

          {/* Watch / connecting overlay */}
          <WatchPanel
            state={agora.state}
            error={agora.error}
            onWatch={handleWatch}
            onLeave={() => void agora.leave()}
          />
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — product card + live chat (fixed)
        ══════════════════════════════════════════ */}
        <div style={{
          width: 368, flexShrink: 0,
          overflow: "hidden",              // right side stays fixed for viewer
          display: "flex", flexDirection: "column",
          padding: "16px 16px 16px 8px",
          gap: 14,
        }}>
          {/* Pinned product */}
          <ProductCard isLive={isLive} />

          {/* Live chat — fills remaining height */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <ChaoticChat viral={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared styles ─── */
const overlayStyle: React.CSSProperties = {
  position: "absolute", inset: 0, zIndex: 20,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  background: "rgba(13,18,23,0.84)", backdropFilter: "blur(16px)",
  gap: 12,
};

const spinnerStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%",
  border: "2px solid var(--xs-border)",
  borderTop: "2px solid var(--xs-accent)",
  animation: "xs-spin 0.9s linear infinite",
};
