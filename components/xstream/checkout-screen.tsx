"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { XIcon } from "./x-icon";
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
const CHANNEL =
  process.env.NEXT_PUBLIC_AGORA_CHANNEL ?? "temp-agora";

interface ProductInfo {
  productId: string;
  name: string;
  price: number;
  colors: string[];
  sizes: string[];
  variants: { color: string; size: string; stock: number }[];
}

type UISignal =
  | { action: "HIGHLIGHT"; color?: string; size?: string }
  | { action: "CHECKOUT" }
  | { action: "ADDRESS_CONFIRMED"; address: string }
  | { action: "PAYMENT_SELECTED"; method: "GCASH" | "COD" }
  | { action: "VOUCHER_APPLIED"; code: string; discountPct: number }
  | { action: "PAYMENT_PROCESSING" }
  | { action: "ORDER_PLACED"; orderId: string };

type CallState = "idle" | "launching" | "joining" | "live" | "error";
type CheckoutPhase = "collecting" | "processing" | "placed";

interface UserProfile {
  name: string;
  defaultAddress: string;
  defaultPayment: "GCASH" | "COD";
}

export function CheckoutScreen() {
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [highlightColor, setHighlightColor] = useState<string | null>(null);
  const [highlightSize, setHighlightSize] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<{ code: string; discountPct: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [payment, setPayment] = useState<"GCASH" | "COD" | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [phase, setPhase] = useState<CheckoutPhase>("collecting");

  const [callState, setCallState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [agentLive, setAgentLive] = useState(false);

  const viewerIdRef = useRef<string>("");
  if (!viewerIdRef.current) {
    const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
    viewerIdRef.current =
      url?.searchParams.get("viewerId") ?? "viewer-" + Math.random().toString(36).slice(2, 8);
  }

  const rtcRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<IMicrophoneAudioTrack | null>(null);

  // ── Load product + buyer profile (prefills address/payment) ──────
  useEffect(() => {
    void fetch(`${BACKEND_URL}/api/products/featured`)
      .then((r) => r.json())
      .then((p: ProductInfo) => setProduct(p))
      .catch(() => {});

    void fetch(`${BACKEND_URL}/api/me`)
      .then((r) => r.json())
      .then((p: UserProfile) => {
        setProfile(p);
        setAddress(p.defaultAddress);
        setPayment(p.defaultPayment);
      })
      .catch(() => {});
  }, []);

  // ── Subscribe to the checkout canvas signal stream ──────────────
  useEffect(() => {
    const es = new EventSource(
      `${BACKEND_URL}/api/ui/stream?channel=${encodeURIComponent(CHANNEL)}`
    );
    es.onmessage = (evt) => {
      try {
        const sig = JSON.parse(evt.data) as UISignal;
        switch (sig.action) {
          case "HIGHLIGHT":
            if (sig.color !== undefined) setHighlightColor(sig.color ?? null);
            if (sig.size !== undefined) setHighlightSize(sig.size ?? null);
            break;
          case "VOUCHER_APPLIED":
            setVoucher({ code: sig.code, discountPct: sig.discountPct });
            break;
          case "ADDRESS_CONFIRMED":
            setAddress(sig.address);
            setAddressConfirmed(true);
            break;
          case "PAYMENT_SELECTED":
            setPayment(sig.method);
            setPaymentConfirmed(true);
            break;
          case "PAYMENT_PROCESSING":
            setPhase("processing");
            break;
          case "ORDER_PLACED":
            setOrderId(sig.orderId);
            setPhase("placed");
            // Auto-hang up after the agent's goodbye line finishes.
            window.setTimeout(() => { void teardown(); }, 7000);
            break;
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  // ── Start the AI call: launch the Agora agent, then join RTC ───
  async function startCall() {
    setError(null);
    setCallState("launching");

    try {
      const launchRes = await fetch(`${BACKEND_URL}/api/agent/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: CHANNEL }),
      });
      if (!launchRes.ok) {
        throw new Error(`agent launch failed: ${await launchRes.text()}`);
      }

      setCallState("joining");

      const cfgRes = await fetch(`/api/agora/config?uid=0&channel=${encodeURIComponent(CHANNEL)}`);
      if (!cfgRes.ok) throw new Error("token mint failed");
      const { appId, token } = (await cfgRes.json()) as {
        appId: string;
        token: string;
      };

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(2);
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      rtcRef.current = client;

      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.setVolume(100);
          user.audioTrack.play();
        }
        setAgentLive(true);
      });
      client.on("user-left", () => setAgentLive(false));

      await client.join(appId, CHANNEL, token, 0);

      // Mic is best-effort — if the browser blocks it, the buyer can
      // still hear Nova; they just can't talk back. Don't tear the
      // whole call down for a mic permission error.
      try {
        const mic = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true });
        micRef.current = mic;
        await client.publish([mic]);
      } catch (micErr) {
        const msg = micErr instanceof Error ? micErr.message : String(micErr);
        setError(`Mic blocked — you can hear Nova but she can't hear you. (${msg})`);
      }

      setCallState("live");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setCallState("error");
      await teardown();
    }
  }

  async function teardown() {
    try {
      micRef.current?.stop();
      micRef.current?.close();
      await rtcRef.current?.leave();
    } catch {}
    rtcRef.current = null;
    micRef.current = null;
    setAgentLive(false);
  }

  useEffect(() => {
    return () => { void teardown(); };
  }, []);

  const subtotal = product?.price ?? 0;
  const discount = voucher ? Math.round(subtotal * (voucher.discountPct / 100)) : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="xs-root" style={{
      width: "100%", minHeight: "100vh",
      background: "var(--xs-bg)", color: "var(--xs-text)",
      display: "flex", flexDirection: "column", overflow: "auto",
    }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 52, padding: "0 22px",
        display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid var(--xs-border-s)",
        background: "var(--xs-bg-el)", flexShrink: 0,
      }}>
        <Link href="/xstream/watch" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 20,
          background: "var(--xs-surf)", border: "1px solid var(--xs-border)",
          color: "var(--xs-text-2)", fontSize: 11.5, textDecoration: "none",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to stream
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Checkout · Nova is closing your order
          </div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
            Voice-driven · {agentLive ? "agent live" : callState === "live" ? "you're connected" : "tap to start the call"}
          </div>
        </div>
        <span className="xs-eyebrow">SukiCloser</span>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: 1, display: "grid", gridTemplateColumns: "1.2fr 0.9fr", gap: 18,
        padding: 22, maxWidth: 1200, margin: "0 auto", width: "100%",
      }}>
        {/* LEFT — order summary (display-only, Nova drives everything) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {phase === "placed" && orderId ? (
            <SuccessCard orderId={orderId} productName={product?.name ?? ""} total={total} />
          ) : phase === "processing" ? (
            <ProcessingCard total={total} />
          ) : (
            <>
              <PipelineFlow
                size={highlightSize}
                color={highlightColor}
                address={address}
                addressConfirmed={addressConfirmed}
                payment={payment}
                paymentConfirmed={paymentConfirmed}
                voucher={voucher}
                phase={phase}
              />

              <ProductCard product={product} />

              {product && (
                <LiveSummaryCard
                  product={product}
                  color={highlightColor}
                  size={highlightSize}
                  voucher={voucher}
                  address={address}
                  addressConfirmed={addressConfirmed}
                  payment={payment}
                  paymentConfirmed={paymentConfirmed}
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                />
              )}

              <VoiceCoachCard
                callState={callState}
                color={highlightColor}
                size={highlightSize}
                addressConfirmed={addressConfirmed}
                paymentConfirmed={paymentConfirmed}
                profile={profile}
              />
            </>
          )}
        </div>

        {/* RIGHT — Nova call panel */}
        <div>
          <CallPanel
            callState={callState}
            agentLive={agentLive}
            error={error}
            onStart={() => void startCall()}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pipeline flow — 6 step tracker that fills in live
───────────────────────────────────────────────────────── */
type StepStatus = "pending" | "active" | "default" | "done";

function PipelineFlow({
  size, color, address, addressConfirmed, payment, paymentConfirmed, voucher, phase,
}: {
  size: string | null;
  color: string | null;
  address: string | null;
  addressConfirmed: boolean;
  payment: "GCASH" | "COD" | null;
  paymentConfirmed: boolean;
  voucher: { code: string; discountPct: number } | null;
  phase: CheckoutPhase;
}) {
  // "default" = prefilled from buyer profile but Nova hasn't confirmed yet
  const stateFor = (filled: boolean, confirmed: boolean): "pending" | "default" | "done" =>
    !filled ? "pending" : confirmed ? "done" : "default";

  const checks: { label: string; state: "pending" | "default" | "done" }[] = [
    { label: "Size",     state: size ? "done" : "pending" },
    { label: "Color",    state: color ? "done" : "pending" },
    { label: "Address",  state: stateFor(!!address, addressConfirmed) },
    { label: "Payment",  state: stateFor(!!payment, paymentConfirmed) },
    { label: "Voucher",  state: voucher ? "done" : "pending" },
    { label: "Confirm",  state: phase !== "collecting" ? "done" : "pending" },
  ];
  // "Active" = first step that isn't fully done (defaults count as not-yet-done).
  const firstNotDone = checks.findIndex((c) => c.state !== "done");
  const steps = checks.map<{ label: string; status: StepStatus }>((c, i) => ({
    label: c.label,
    status: c.state === "done" ? "done"
          : i === firstNotDone ? "active"
          : c.state === "default" ? "default"
          : "pending",
  }));

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 14,
      background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <Step index={i + 1} label={s.label} status={s.status} />
            {i < steps.length - 1 && <Connector active={steps[i].status === "done"} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Step({ index, label, status }: { index: number; label: string; status: StepStatus }) {
  const palette = {
    done:    { bg: "var(--xs-good)",        border: "var(--xs-good)",      ink: "#0a1410", text: "var(--xs-text)"   },
    active:  { bg: "var(--xs-accent-f)",    border: "var(--xs-accent-d)",  ink: "var(--xs-accent-d)", text: "var(--xs-text)" },
    default: { bg: "var(--xs-surf-2)",      border: "var(--xs-warn)",      ink: "var(--xs-warn)",     text: "var(--xs-text-2)" },
    pending: { bg: "var(--xs-surf-2)",      border: "var(--xs-border-s)",  ink: "var(--xs-text-m)", text: "var(--xs-text-3)" },
  }[status];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      flexShrink: 0,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: palette.bg,
        border: `1.5px solid ${palette.border}`,
        color: palette.ink,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        boxShadow: status === "active"
          ? "0 0 0 4px color-mix(in oklch, var(--xs-accent-d) 22%, transparent)"
          : "none",
        animation: status === "active" ? "xs-pulse 1.6s ease-in-out infinite" : "none",
        transition: "all 220ms ease",
      }}>
        {status === "done" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        ) : index}
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 600,
        color: palette.text, letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div style={{
      flex: 1, height: 1.5, margin: "0 4px",
      marginBottom: 18,
      background: active ? "var(--xs-good)" : "var(--xs-border)",
      transition: "background 220ms ease",
    }}/>
  );
}

/* ─────────────────────────────────────────────────────────
   Live summary — single read-only card showing everything
   Nova has collected so far. Pieces fade in as they arrive.
───────────────────────────────────────────────────────── */
function LiveSummaryCard({
  product, color, size, voucher, address, addressConfirmed, payment, paymentConfirmed, subtotal, discount, total,
}: {
  product: ProductInfo;
  color: string | null;
  size: string | null;
  voucher: { code: string; discountPct: number } | null;
  address: string | null;
  addressConfirmed: boolean;
  payment: "GCASH" | "COD" | null;
  paymentConfirmed: boolean;
  subtotal: number; discount: number; total: number;
}) {
  return (
    <div style={{
      padding: 20, borderRadius: 14,
      background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span className="xs-ai-dot" />
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Live order summary</span>
        <span style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
          Nova fills this in as you talk
        </span>
      </div>

      <SummaryRow label="Color"   value={color   ? cap(color) : null} />
      <SummaryRow label="Size"    value={size}                          />
      <SummaryRow label="Address" value={address}  pending={!!address && !addressConfirmed} />
      <SummaryRow label="Payment" value={payment}  pending={!!payment && !paymentConfirmed} />
      <SummaryRow label="Voucher" value={voucher ? `${voucher.discountPct}% off` : null} accent />

      <div style={{ height: 1, background: "var(--xs-border-s)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
        <BreakdownRow k="Subtotal" v={`₱${subtotal.toLocaleString()}`} />
        {discount > 0 && (
          <BreakdownRow k="Discount" v={`−₱${discount.toLocaleString()}`} tone="good" />
        )}
        <BreakdownRow k="Shipping · 3–5 days" v="Free" />
        <div style={{
          paddingTop: 8, marginTop: 2,
          borderTop: "1px solid var(--xs-border-s)",
          display: "flex", justifyContent: "space-between",
          fontWeight: 700, color: "var(--xs-text)", fontSize: 17,
        }}>
          <span>Total</span>
          <span className="xs-tnum">₱{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, accent, pending,
}: {
  label: string; value: string | null; accent?: boolean; pending?: boolean;
}) {
  const filled = !!value;
  const borderColor = pending
    ? "var(--xs-warn)"
    : accent ? "var(--xs-accent-s)" : "var(--xs-border-s)";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", borderRadius: 9, gap: 10,
      background: filled ? "var(--xs-surf-2)" : "transparent",
      border: filled ? `1px solid ${borderColor}` : "1px dashed var(--xs-border-s)",
      transition: "all 240ms ease",
    }}>
      <span style={{ fontSize: 11, color: "var(--xs-text-3)", letterSpacing: "0.06em", flexShrink: 0 }}>{label.toUpperCase()}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, justifyContent: "flex-end" }}>
        {filled && pending && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em",
            padding: "2px 6px", borderRadius: 6,
            background: "color-mix(in oklch, var(--xs-warn) 18%, transparent)",
            color: "var(--xs-warn)",
            textTransform: "uppercase",
            flexShrink: 0,
          }}>
            Default
          </span>
        )}
        <span style={{
          fontSize: 13, fontWeight: filled ? 600 : 400,
          color: filled ? (accent ? "var(--xs-accent-d)" : "var(--xs-text)") : "var(--xs-text-m)",
          fontStyle: filled ? "normal" : "italic",
          textAlign: "right", overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {filled ? value : "waiting…"}
        </span>
      </div>
    </div>
  );
}

function BreakdownRow({ k, v, tone }: { k: string; v: string; tone?: "good" }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      color: tone === "good" ? "var(--xs-good)" : "var(--xs-text-2)",
    }}>
      <span>{k}</span>
      <span className="xs-tnum">{v}</span>
    </div>
  );
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ─────────────────────────────────────────────────────────
   Voice coach card — coaches the buyer on what to say next
───────────────────────────────────────────────────────── */
function VoiceCoachCard({
  callState, color, size, addressConfirmed, paymentConfirmed, profile,
}: {
  callState: CallState;
  color: string | null;
  size: string | null;
  addressConfirmed: boolean;
  paymentConfirmed: boolean;
  profile: UserProfile | null;
}) {
  let hint = "";
  if (callState !== "live") {
    hint = profile
      ? `Tap Start Call. Nova has your saved address and ${profile.defaultPayment} ready — she'll just need you to confirm.`
      : "Tap Start Call. Nova will guide the whole checkout from there.";
  } else if (!color || !size) {
    hint = "Tell Nova your size and color. e.g. \"black, size 43\".";
  } else if (!addressConfirmed) {
    hint = "Confirm your saved address — just say \"yes\" or \"use the one on file\".";
  } else if (!paymentConfirmed) {
    hint = `Confirm payment — say \"yes\" to use ${profile?.defaultPayment ?? "GCash"} or name another.`;
  } else {
    hint = "Almost done — say \"lock it in\" or \"go\" and Nova will close the order.";
  }

  return (
    <div style={{
      padding: 14, borderRadius: 12,
      background: "var(--xs-accent-f)", border: "1px solid var(--xs-accent-s)",
      display: "flex", gap: 12, alignItems: "center",
    }}>
      <XIcon name="mic" size={14} style={{ color: "var(--xs-accent-d)", flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 12.5, color: "var(--xs-text-2)", lineHeight: 1.45 }}>
        <strong style={{ color: "var(--xs-text)" }}>Hint:</strong> {hint}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Processing card — shown after Nova calls complete_order
───────────────────────────────────────────────────────── */
function ProcessingCard({ total }: { total: number }) {
  return (
    <div style={{
      padding: 40, borderRadius: 14,
      background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
      textAlign: "center",
      animation: "xs-card-in 240ms ease-out both",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        margin: "0 auto 16px",
        border: "3px solid var(--xs-border)",
        borderTopColor: "var(--xs-accent-d)",
        animation: "xs-spin 0.9s linear infinite",
      }} />
      <div className="xs-serif" style={{ fontSize: 24, color: "var(--xs-text)", marginBottom: 4 }}>
        Processing payment…
      </div>
      <div style={{ fontSize: 13, color: "var(--xs-text-2)" }}>
        Charging ₱{total.toLocaleString()}
      </div>

      <style jsx>{`
        @keyframes xs-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Product card
───────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: ProductInfo | null }) {
  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "center",
      padding: 16, borderRadius: 14,
      background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
    }}>
      <div style={{
        width: 76, height: 76, borderRadius: 10,
        background: "linear-gradient(135deg, #d4a574, #8a5a3a)", flexShrink: 0,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--xs-text)" }}>
          {product?.name ?? "Loading…"}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--xs-text-3)", marginTop: 2 }}>
          Curated by Nova · stock pulled live
        </div>
      </div>
      <div className="xs-tnum" style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--xs-text)" }}>
          {product ? `₱${product.price.toLocaleString()}` : "—"}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   Success card
───────────────────────────────────────────────────────── */
function SuccessCard({ orderId, productName, total }: { orderId: string; productName: string; total: number }) {
  return (
    <div style={{
      padding: 32, borderRadius: 14,
      background: "linear-gradient(135deg, var(--xs-accent-f), var(--xs-surf))",
      border: "1px solid var(--xs-good)",
      textAlign: "center",
      animation: "xs-card-in 360ms ease-out both",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "color-mix(in oklch, var(--xs-good) 30%, var(--xs-surf))",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 14px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--xs-good)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div className="xs-serif" style={{ fontSize: 28, color: "var(--xs-text)", marginBottom: 4 }}>
        Order placed.
      </div>
      <div style={{ fontSize: 13, color: "var(--xs-text-2)", marginBottom: 18 }}>
        Thanks for shopping with us — {productName} is on its way.
      </div>
      <div className="xs-tnum" style={{
        display: "inline-block", padding: "6px 14px", borderRadius: 8,
        background: "var(--xs-surf-2)", border: "1px solid var(--xs-border-s)",
        fontSize: 12, color: "var(--xs-text-2)", marginBottom: 6,
      }}>
        Order {orderId}
      </div>
      <div className="xs-tnum" style={{ fontSize: 16, fontWeight: 700, color: "var(--xs-text)" }}>
        ₱{total.toLocaleString()}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nova call panel
───────────────────────────────────────────────────────── */
function CallPanel({
  callState, agentLive, error, onStart,
}: {
  callState: CallState; agentLive: boolean; error: string | null;
  onStart: () => void;
}) {
  const stateLabel: Record<CallState, string> = {
    idle: "Tap to call Nova",
    launching: "Launching Nova…",
    joining: "Connecting…",
    live: agentLive ? "Nova is on the call" : "Connected — Nova joining…",
    error: "Connection failed",
  };

  return (
    <div style={{
      padding: 22, borderRadius: 14,
      background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
      position: "sticky", top: 22,
    }}>
      <span className="xs-eyebrow">Voice agent</span>

      {/* Orb */}
      <div style={{ position: "relative" }}>
        <div className="xs-breath" style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: `1px solid ${agentLive ? "var(--xs-warn)" : "var(--xs-accent)"}`,
          opacity: 0.4, pointerEvents: "none",
        }} />
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: agentLive
            ? "radial-gradient(ellipse at 35% 35%, #d4a574, #c89970 40%, #7a5a3a 80%, #2a1810)"
            : "radial-gradient(ellipse at 35% 35%, #a4c0db, #7a9ab8 40%, #3a5578 80%, #1a2532)",
          boxShadow: agentLive
            ? "inset 0 1px 1px rgba(255,255,255,0.18), 0 0 36px rgba(200,153,112,0.4)"
            : "inset 0 1px 1px rgba(255,255,255,0.12), 0 0 24px rgba(122,154,184,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: agentLive ? "xs-orb-speak 1.8s ease-in-out infinite" : "xs-orb-idle 4s ease-in-out infinite",
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(246,242,234,0.7)", letterSpacing: "0.04em" }}>
            N
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div className="xs-serif" style={{ fontSize: 20, color: "var(--xs-text)" }}>Nova</div>
        <div style={{ fontSize: 12, color: "var(--xs-text-3)", marginTop: 2 }}>
          {stateLabel[callState]}
        </div>
      </div>

      {callState === "idle" || callState === "error" ? (
        <button
          onClick={onStart}
          className="xs-btn xs-btn-primary"
          style={{
            width: "100%", padding: "13px 0",
            fontSize: 13.5, fontWeight: 700, justifyContent: "center",
            borderRadius: 10,
          }}
        >
          <XIcon name="mic" size={15} />
          {callState === "error" ? "Try again" : "Start call"}
        </button>
      ) : (
        <div style={{
          width: "100%", padding: "11px 0",
          borderRadius: 10, background: "var(--xs-surf-2)",
          border: "1px solid var(--xs-border)",
          textAlign: "center", fontSize: 12, color: "var(--xs-text-2)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: agentLive ? "var(--xs-good)" : "var(--xs-accent)",
            animation: "xs-pulse 1.4s ease-in-out infinite",
          }}/>
          {callState === "live" ? "Mic open" : "Connecting…"}
        </div>
      )}

      {error && (
        <div style={{
          padding: 10, borderRadius: 8, fontSize: 11.5, lineHeight: 1.45,
          background: "color-mix(in oklch, var(--xs-warn) 12%, var(--xs-surf-2))",
          border: "1px solid var(--xs-warn)", color: "var(--xs-text-2)",
        }}>
          {error}
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--xs-text-3)", textAlign: "center", lineHeight: 1.5 }}>
        Say the size, color, address, and payment method.<br/>
        When you&apos;re ready, say <span style={{ color: "var(--xs-text-2)" }}>&ldquo;that&apos;s it&rdquo;</span> to finalize.
      </div>
    </div>
  );
}
