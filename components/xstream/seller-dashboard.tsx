"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { XIcon } from "./x-icon";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

type AnalyticsEvent =
  | { type: "VIEWER_JOINED"; viewerId: string; ts: number }
  | { type: "QUESTION_ASKED"; viewerId: string; text: string; ts: number }
  | { type: "AI_ANSWERED"; viewerId: string; question: string; answer: string; ts: number }
  | { type: "VARIANT_HIGHLIGHTED"; color?: string; size?: string; ts: number }
  | { type: "VOUCHER_APPLIED"; code: string; discountPct: number; ts: number }
  | { type: "CHECKOUT_INTENT"; viewerId: string; productId: string; ts: number }
  | { type: "SALE_CLOSED"; viewerId?: string; productId: string; color?: string; size?: string; paymentMethod?: string; ts: number };

interface Counters {
  viewers: Set<string>;
  questions: number;
  replies: number;
  vouchers: number;
  checkouts: number;
  sales: number;
}

const EMPTY_COUNTERS: Counters = {
  viewers: new Set(),
  questions: 0,
  replies: 0,
  vouchers: 0,
  checkouts: 0,
  sales: 0,
};

function applyCounters(prev: Counters, ev: AnalyticsEvent): Counters {
  const next: Counters = { ...prev, viewers: new Set(prev.viewers) };
  if (ev.type === "VIEWER_JOINED") next.viewers.add(ev.viewerId);
  if (ev.type === "QUESTION_ASKED") next.questions++;
  if (ev.type === "AI_ANSWERED") next.replies++;
  if (ev.type === "VOUCHER_APPLIED") next.vouchers++;
  if (ev.type === "CHECKOUT_INTENT") next.checkouts++;
  if (ev.type === "SALE_CLOSED") next.sales++;
  return next;
}

export function SellerDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [counters, setCounters] = useState<Counters>(EMPTY_COUNTERS);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");

  useEffect(() => {
    // Backfill from the ring buffer.
    void fetch(`${BACKEND_URL}/api/analytics/recent`)
      .then((r) => r.json())
      .then(({ events: ringEvents }: { events: AnalyticsEvent[] }) => {
        setEvents(ringEvents.slice().reverse());
        let c: Counters = EMPTY_COUNTERS;
        for (const ev of ringEvents) c = applyCounters(c, ev);
        setCounters(c);
      })
      .catch(() => {});

    const es = new EventSource(`${BACKEND_URL}/api/analytics/stream`);
    es.onopen = () => setStatus("live");
    es.onerror = () => setStatus("offline");
    es.onmessage = (evt) => {
      try {
        const ev = JSON.parse(evt.data) as AnalyticsEvent;
        setEvents((prev) => [ev, ...prev].slice(0, 150));
        setCounters((prev) => applyCounters(prev, ev));
      } catch {}
    };
    return () => es.close();
  }, []);

  return (
    <div className="xs-root" style={{
      width: "100%", minHeight: "100vh",
      background: "var(--xs-bg)", color: "var(--xs-text)",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 52, padding: "0 22px",
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Seller dashboard</div>
          <div style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
            Real-time view of buyer activity, AI responses, and sales.
          </div>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 20,
          background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
          fontSize: 11, color: "var(--xs-text-2)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: status === "live" ? "var(--xs-good)" : status === "connecting" ? "var(--xs-warn)" : "var(--xs-text-m)",
            boxShadow: status === "live" ? "0 0 6px var(--xs-good)" : "none",
          }}/>
          {status}
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: 1, padding: 22, maxWidth: 1280, margin: "0 auto", width: "100%",
        display: "flex", flexDirection: "column", gap: 18,
      }}>

        {/* Counter strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12,
        }}>
          <Stat label="Viewers"        value={counters.viewers.size} />
          <Stat label="Questions"      value={counters.questions} />
          <Stat label="AI replies"     value={counters.replies}    accent />
          <Stat label="Vouchers"       value={counters.vouchers} />
          <Stat label="Checkouts"      value={counters.checkouts} />
          <Stat label="Sales closed"   value={counters.sales}      good />
        </div>

        {/* Live feed */}
        <div style={{
          border: "1px solid var(--xs-border-s)", borderRadius: 14,
          background: "var(--xs-surf)", overflow: "hidden",
          display: "flex", flexDirection: "column", minHeight: 400,
        }}>
          <div style={{
            padding: "12px 18px", borderBottom: "1px solid var(--xs-border-s)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--xs-good)", boxShadow: "0 0 6px var(--xs-good)",
            }}/>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Live events</span>
            <span style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
              everything happening on the stream right now
            </span>
            <div style={{ flex: 1 }}/>
            <span className="xs-tnum" style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
              {events.length} events
            </span>
          </div>

          <div className="xs-scroll" style={{
            flex: 1, overflowY: "auto", padding: "4px 0",
          }}>
            {events.length === 0 ? (
              <div style={{
                padding: 36, textAlign: "center", color: "var(--xs-text-3)", fontSize: 12.5,
              }} className="xs-serif">
                Waiting for the first buyer activity…
              </div>
            ) : (
              events.map((ev, i) => <EventRow key={i} ev={ev} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, good }: { label: string; value: number; accent?: boolean; good?: boolean }) {
  const color = good ? "var(--xs-good)" : accent ? "var(--xs-accent-d)" : "var(--xs-text)";
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 12,
      background: "var(--xs-surf)", border: "1px solid var(--xs-border-s)",
    }}>
      <div className="xs-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div className="xs-tnum" style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}

function EventRow({ ev }: { ev: AnalyticsEvent }) {
  const meta = describe(ev);
  const ts = new Date(ev.ts).toISOString().slice(11, 19);

  return (
    <div style={{
      padding: "9px 18px", display: "flex", gap: 12, alignItems: "center",
      borderBottom: "1px solid var(--xs-border-s)",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `color-mix(in oklch, ${meta.color} 14%, var(--xs-surf))`,
        color: meta.color, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <XIcon name={meta.icon} size={13}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--xs-text)", fontWeight: 500 }}>
          {meta.title}
        </div>
        {meta.sub && (
          <div style={{ fontSize: 11, color: "var(--xs-text-3)", marginTop: 1.5 }}>
            {meta.sub}
          </div>
        )}
      </div>
      <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)", flexShrink: 0 }}>
        {ts}
      </span>
    </div>
  );
}

function describe(ev: AnalyticsEvent): { icon: "cart" | "bolt" | "sparkle" | "fire" | "agents" | "mic"; color: string; title: string; sub?: string } {
  switch (ev.type) {
    case "VIEWER_JOINED":
      return { icon: "agents", color: "var(--xs-accent)", title: "Viewer joined the stream", sub: ev.viewerId };
    case "QUESTION_ASKED":
      return { icon: "mic", color: "var(--xs-warn)", title: `Q: "${ev.text}"`, sub: ev.viewerId };
    case "AI_ANSWERED":
      return { icon: "sparkle", color: "var(--xs-accent-d)", title: `Nova replied`, sub: `→ ${ev.answer}` };
    case "VARIANT_HIGHLIGHTED":
      return { icon: "bolt", color: "var(--xs-accent)", title: `Highlighted ${[ev.color, ev.size].filter(Boolean).join(" · ")}` };
    case "VOUCHER_APPLIED":
      return { icon: "sparkle", color: "var(--xs-accent-d)", title: `Voucher ${ev.code} — ${ev.discountPct}% off` };
    case "CHECKOUT_INTENT":
      return { icon: "cart", color: "var(--xs-warn)", title: "Heading to checkout", sub: `${ev.viewerId} · ${ev.productId}` };
    case "SALE_CLOSED":
      return {
        icon: "cart", color: "var(--xs-good)",
        title: `SALE — ${ev.productId} ${[ev.color, ev.size].filter(Boolean).join(" / ")}`.trim(),
        sub: ev.paymentMethod ? `paid via ${ev.paymentMethod}` : undefined,
      };
  }
}
