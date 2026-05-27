import React from "react";
import { XIcon } from "./x-icon";

interface CheckoutFlyoutProps {
  onClose: () => void;
}

export function CheckoutFlyout({ onClose }: CheckoutFlyoutProps) {
  return (
    <div style={{
      position: "absolute", right: 18, bottom: 18, width: 360,
      background: "var(--xs-bg-el)",
      border: "1px solid var(--xs-border)",
      borderRadius: 16, boxShadow: "var(--xs-shadow-xl)",
      padding: 18, zIndex: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <span className="xs-ai-dot"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>Nova prepared your checkout</div>
          <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>Personalised · valid for 03:48</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: 0, cursor: "pointer", color: "var(--xs-text-3)", padding: 4 }}
        >
          <XIcon name="x" size={14}/>
        </button>
      </div>

      {/* Product row */}
      <div style={{
        display: "flex", gap: 12, alignItems: "center",
        padding: 12, borderRadius: 10,
        background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)", marginBottom: 10,
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: 8,
          background: "linear-gradient(135deg, #d4a574, #8a5a3a)", flexShrink: 0,
        }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)" }}>Solstice Hoodie</div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)" }}>Sand · Medium · per Nova</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="xs-tnum" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--xs-text)" }}>$84</div>
          <div className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)", textDecoration: "line-through" }}>$118</div>
        </div>
      </div>

      {/* Bundle upsell */}
      <div style={{
        padding: 11, borderRadius: 10,
        background: "var(--xs-accent-f)", border: "1px dashed var(--xs-accent)",
        marginBottom: 14, display: "flex", gap: 10, alignItems: "center",
      }}>
        <XIcon name="sparkle" size={14} style={{ color: "var(--xs-accent)", flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: "var(--xs-text)", fontWeight: 500 }}>Add the Tote · $24</div>
          <div style={{ fontSize: 10.5, color: "var(--xs-text-2)" }}>Bundle gets you free shipping</div>
        </div>
        <button style={{
          padding: "5px 9px", borderRadius: 7, border: "1px solid var(--xs-accent)",
          background: "transparent", color: "var(--xs-accent)", fontSize: 11, fontWeight: 600, cursor: "pointer",
        }}>Add</button>
      </div>

      {/* Price breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 11.5, color: "var(--xs-text-2)", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span className="xs-tnum">$84.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Nova&apos;s discount</span>
          <span className="xs-tnum" style={{ color: "var(--xs-good)" }}>−$11.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Shipping · 3–5 days</span>
          <span className="xs-tnum">Free</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          paddingTop: 6, marginTop: 2, borderTop: "1px solid var(--xs-border-s)",
          color: "var(--xs-text)", fontWeight: 600,
        }}>
          <span>Total</span>
          <span className="xs-tnum">$73.00</span>
        </div>
      </div>

      {/* CTA */}
      <button className="xs-btn xs-btn-primary" style={{ width: "100%", padding: "12px", fontSize: 13, fontWeight: 600 }}>
        One-click checkout · keeps stream playing
      </button>
      <div style={{ fontSize: 10.5, color: "var(--xs-text-3)", textAlign: "center", marginTop: 8 }}>
        Paying with Apple Pay · stream continues in background
      </div>
    </div>
  );
}
