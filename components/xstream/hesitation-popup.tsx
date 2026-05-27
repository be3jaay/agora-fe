"use client";

import { XIcon } from "./x-icon";

export type TriggerType = "hesitation" | "question" | "price-doubt";

interface HesitationPopupProps {
  triggerType: TriggerType;
  triggerWord: string;
  onClose: () => void;
  onCheckout: () => void;
}

export function HesitationPopup({ onClose, onCheckout }: HesitationPopupProps) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(10,14,19,0.55)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      animation: "xs-backdrop-in 280ms ease both",
      pointerEvents: "all",
    }}>
    <div style={{
      width: 300,
      background: "rgba(16,22,30,0.96)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 20,
      padding: "20px 20px 18px",
      animation: "xs-card-in 380ms cubic-bezier(0.34,1.56,0.64,1) both",
      boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,153,112,0.07)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginTop: 1,
          background: "radial-gradient(ellipse at 35% 35%, #c89970, #a07050 40%, #4a3020 80%, #1e1008)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.14), 0 0 16px rgba(200,153,112,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "rgba(246,242,234,0.65)",
        }}>N</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--xs-text)", lineHeight: 1.3, marginBottom: 3 }}>
            Having trouble?
          </div>
          <div className="xs-serif" style={{
            fontSize: 12, color: "var(--xs-text-2)", lineHeight: 1.45, fontStyle: "italic",
          }}>
            Talk to our voice agent — Nova will walk you through everything in real time.
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none", border: 0, cursor: "pointer",
            color: "var(--xs-text-3)", padding: 2, borderRadius: 6, flexShrink: 0,
            display: "flex", alignItems: "center", marginTop: 1,
            transition: "color 150ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--xs-text-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--xs-text-3)")}
        >
          <XIcon name="x" size={13} />
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={onCheckout}
        style={{
          width: "100%", fontSize: 12.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "10px 0", borderRadius: 10, cursor: "pointer",
          background: "var(--xs-accent-f)",
          border: "1px solid var(--xs-accent-s)",
          color: "var(--xs-accent-d)",
          transition: "all 150ms ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--xs-accent-s)";
          e.currentTarget.style.color = "var(--xs-text)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "var(--xs-accent-f)";
          e.currentTarget.style.color = "var(--xs-accent-d)";
        }}
      >
        <XIcon name="mic" size={13} />
        Go to checkout &rarr;
      </button>
    </div>
    </div>
  );
}
