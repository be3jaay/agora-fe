"use client";

import React, { useState } from "react";
import { XIcon } from "./x-icon";

/* ═══════════════════════════════════════════════════════════
   Mock data
═══════════════════════════════════════════════════════════ */

interface Deal {
  user: string;
  product: string;
  variant: string;
  price: number;
  minsAgo: number;
  source: "ai" | "direct";
}

const DEALS_CALM: Deal[] = [
  { user: "jen_m",    product: "Solstice Hoodie",  variant: "Sand · M",          price: 84,  minsAgo: 0,  source: "ai"     },
  { user: "carlo.r",  product: "Solstice Hoodie",  variant: "Navy · L",          price: 84,  minsAgo: 1,  source: "ai"     },
  { user: "ph_buyer", product: "Bundle",            variant: "Hoodie + Cap",      price: 218, minsAgo: 2,  source: "ai"     },
  { user: "sari_k",   product: "Solstice Cap",      variant: "Olive · M",         price: 42,  minsAgo: 3,  source: "direct" },
  { user: "marisol",  product: "Solstice Hoodie",  variant: "Sand · S",          price: 84,  minsAgo: 5,  source: "ai"     },
  { user: "diego",    product: "Bundle",            variant: "Hoodie + Jogger",   price: 180, minsAgo: 6,  source: "ai"     },
  { user: "rae",      product: "Solstice Hoodie",  variant: "Black · M",         price: 84,  minsAgo: 9,  source: "ai"     },
  { user: "kim.07",   product: "Solstice Jogger",  variant: "Sand · M",          price: 96,  minsAgo: 11, source: "direct" },
  { user: "tina.f",   product: "Solstice Hoodie",  variant: "Navy · XS",         price: 84,  minsAgo: 14, source: "ai"     },
  { user: "anya",     product: "Bundle",            variant: "Hoodie + Cap",      price: 218, minsAgo: 17, source: "ai"     },
  { user: "iv__",     product: "Solstice Hoodie",  variant: "Green · M",         price: 84,  minsAgo: 20, source: "direct" },
  { user: "luis",     product: "Solstice Jogger",  variant: "Navy · L",          price: 96,  minsAgo: 24, source: "ai"     },
];

const DEALS_VIRAL: Deal[] = [
  { user: "jen_m",     product: "Solstice Hoodie",  variant: "Sand · M",     price: 84,  minsAgo: 0,  source: "ai"     },
  { user: "batch_022", product: "Bundle × 3",        variant: "Mixed sizes",  price: 654, minsAgo: 0,  source: "ai"     },
  { user: "carlo.r",   product: "Solstice Hoodie",  variant: "Navy · L",     price: 84,  minsAgo: 0,  source: "ai"     },
  { user: "ph_buyer",  product: "Bundle",            variant: "Hoodie + Cap", price: 218, minsAgo: 1,  source: "ai"     },
  { user: "sari_k",    product: "Solstice Cap",      variant: "Olive · M",   price: 42,  minsAgo: 1,  source: "direct" },
  { user: "marisol",   product: "Solstice Hoodie",  variant: "Sand · S",     price: 84,  minsAgo: 1,  source: "ai"     },
  { user: "batch_041", product: "Bundle × 6",        variant: "Mixed",        price: 1308,minsAgo: 2,  source: "ai"     },
  { user: "diego",     product: "Bundle",            variant: "Full set",     price: 252, minsAgo: 2,  source: "ai"     },
  { user: "rae",       product: "Solstice Hoodie",  variant: "Black · M",    price: 84,  minsAgo: 3,  source: "ai"     },
  { user: "kim.07",    product: "Solstice Jogger",  variant: "Sand · M",     price: 96,  minsAgo: 3,  source: "direct" },
];

// Revenue per minute for the last 16 minutes (in USD)
const REVENUE_CALM  = [320, 480, 410, 560, 720, 510, 890, 1040, 960, 1160, 1320, 1480, 1240, 1560, 1720, 1840];
const REVENUE_VIRAL = [1200,1840,1560,2240,2880,2040,3560,4160,3840,4640,5280,5920,4960,6240,6880,7360];

const FUNNEL_CALM  = { views: 12408, engaged: 4820, cart: 1842, checkout: 982, orders: 842 };
const FUNNEL_VIRAL = { views: 84217, engaged: 34620, cart: 12804, checkout: 7220, orders: 6482 };

const PRODUCTS_CALM = [
  { name: "Solstice Hoodie", units: 492, gmv: 41328, pct: 100 },
  { name: "Bundle deal",     units: 148, gmv: 32264, pct: 78  },
  { name: "Solstice Cap",    units: 284, gmv: 11928, pct: 29  },
  { name: "Solstice Jogger", units: 96,  gmv:  9216, pct: 22  },
];

const PRODUCTS_VIRAL = [
  { name: "Solstice Hoodie", units: 3840, gmv: 322560, pct: 100 },
  { name: "Bundle deal",     units: 1184, gmv: 258112, pct: 80  },
  { name: "Solstice Cap",    units: 2040, gmv:  85680, pct: 26  },
  { name: "Solstice Jogger", units: 620,  gmv:  59520, pct: 18  },
];

const AI_ACTIONS_CALM = [
  { t: "now",  k: "Pricing hesitation",    v: "@sari_k · cart abandoned 2×",          tone: "warn",   tag: "Offered"   },
  { t: "8s",   k: "Bundle generated",      v: "Hoodie + cap · −12% · 38 sent",        tone: "accent", tag: "Live"      },
  { t: "22s",  k: "High purchase intent",  v: "@diego · medium + medium confirmed",    tone: "good",   tag: "Nudged"    },
  { t: "41s",  k: "Urgency triggered",     v: "Stock warning · M sizes only",          tone: "warn",   tag: "Live"      },
  { t: "1m",   k: "Cross-sell surfaced",   v: "Linen tee · 2,140 viewers shown",      tone: "accent", tag: "Sent"      },
];

const AI_ACTIONS_VIRAL = [
  { t: "now",  k: "Urgency sweep",         v: "Stock-warning · 6,200 viewers",         tone: "warn",   tag: "Triggered" },
  { t: "now",  k: "Bundle wave",           v: "Hoodie + tote · −18% · hesitant buyers",tone: "accent", tag: "Live"      },
  { t: "2s",   k: "Intent cluster",        v: "412 viewers · checkout nudge sent",     tone: "good",   tag: "Nudged"    },
  { t: "4s",   k: "COD personalisation",   v: "PH region · COD offer auto-applied",    tone: "accent", tag: "Sent"      },
  { t: "7s",   k: "VIP handoff",           v: "Iris concierge taking thread",          tone: "good",   tag: "Handed"    },
];

/* ═══════════════════════════════════════════════════════════
   Sub-components
═══════════════════════════════════════════════════════════ */

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${n}`;
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function toneColor(tone: string) {
  if (tone === "warn")  return "var(--xs-warn)";
  if (tone === "good")  return "var(--xs-good)";
  return "var(--xs-accent)";
}

/* KPI tile */
function KpiTile({ label, value, sub, tone = "default" }: {
  label: string; value: string; sub: string; tone?: "good" | "warn" | "default";
}) {
  const subColor = tone === "good" ? "var(--xs-good)" : tone === "warn" ? "var(--xs-warn)" : "var(--xs-text-3)";
  return (
    <div style={{
      flex: 1, padding: "12px 14px", borderRadius: 12,
      border: "1px solid var(--xs-border-s)", background: "var(--xs-surf)",
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--xs-text-3)", marginBottom: 4 }}>
        {label}
      </div>
      <div className="xs-tnum" style={{ fontSize: 20, fontWeight: 700, color: "var(--xs-text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      <div className="xs-tnum" style={{ fontSize: 11, color: subColor, marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}

/* Section wrapper */
function Section({ title, badge, children }: {
  title: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      border: "1px solid var(--xs-border-s)", borderRadius: 14,
      background: "var(--xs-surf)", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{
        padding: "11px 14px", borderBottom: "1px solid var(--xs-border-s)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)", flex: 1 }}>{title}</span>
        {badge && (
          <span style={{
            padding: "2px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 600,
            background: "var(--xs-accent-f)", color: "var(--xs-accent-d)",
            border: "1px solid var(--xs-accent-s)",
          }}>{badge}</span>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════ */

interface StreamAnalyticsProps { viral: boolean }

export function StreamAnalytics({ viral }: StreamAnalyticsProps) {
  const [dealTab, setDealTab] = useState<"ai" | "all">("ai");

  const deals    = viral ? DEALS_VIRAL   : DEALS_CALM;
  const revenue  = viral ? REVENUE_VIRAL : REVENUE_CALM;
  const funnel   = viral ? FUNNEL_VIRAL  : FUNNEL_CALM;
  const products = viral ? PRODUCTS_VIRAL: PRODUCTS_CALM;
  const aiActs   = viral ? AI_ACTIONS_VIRAL : AI_ACTIONS_CALM;

  const totalGmv    = deals.reduce((s, d) => s + d.price, 0);
  const aiDeals     = deals.filter(d => d.source === "ai");
  const aiGmv       = aiDeals.reduce((s, d) => s + d.price, 0);
  const aiClosePct  = Math.round((aiDeals.length / deals.length) * 100);
  const revenueMax  = Math.max(...revenue);
  const funnelMax   = funnel.views;
  const fullGmv     = viral ? 184260 : 48260;
  const fullOrders  = viral ? 6842 : 842;

  const visibleDeals = dealTab === "ai" ? deals.filter(d => d.source === "ai") : deals;

  return (
    <div
      className="xs-scroll"
      style={{
        height: "100%", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 14,
        paddingRight: 2,
      }}
    >

      {/* ── Section label ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9, flexShrink: 0,
      }}>
        <span className="xs-ai-dot" style={{ width: 7, height: 7 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--xs-text)" }}>Stream Analytics</span>
        <span style={{ fontSize: 11, color: "var(--xs-text-3)" }}>· live</span>
        <div style={{ flex: 1 }} />
        <span className="xs-tnum" style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
          {viral ? "Viral mode" : "Normal mode"}
        </span>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <KpiTile label="GMV"     value={fmt(fullGmv)}         sub={viral ? "+$7,360/min" : "+$1,840/min"} tone="good" />
        <KpiTile label="Orders"  value={fmtCount(fullOrders)} sub={viral ? "+412/min" : "+84/min"}        tone="good" />
      </div>
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <KpiTile label="Viewers"     value={fmtCount(funnel.views)} sub={viral ? "+6,402/min" : "+184/min"} />
        <KpiTile label="AI Convos"   value={fmtCount(viral ? 12604 : 2642)} sub={viral ? "94% resolved" : "82% resolved"} tone="good" />
      </div>

      {/* ── AI Closed Deals ── */}
      <div style={{
        border: "1px solid var(--xs-border-s)", borderRadius: 14,
        background: "var(--xs-surf)", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: "11px 14px", borderBottom: "1px solid var(--xs-border-s)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span className="xs-ai-dot" style={{ width: 7, height: 7 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--xs-text)", flex: 1 }}>
            AI Closed Deals
          </span>
          <span className="xs-tnum" style={{ fontSize: 11, color: "var(--xs-good)", fontWeight: 600 }}>
            {aiClosePct}% close rate
          </span>
        </div>

        {/* Summary row */}
        <div style={{
          padding: "10px 14px", background: "var(--xs-accent-f)",
          borderBottom: "1px solid var(--xs-border-s)",
          display: "flex", gap: 20,
        }}>
          <div>
            <div className="xs-tnum" style={{ fontSize: 18, fontWeight: 700, color: "var(--xs-text)" }}>
              {aiDeals.length}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>deals by Nova</div>
          </div>
          <div>
            <div className="xs-tnum" style={{ fontSize: 18, fontWeight: 700, color: "var(--xs-good)" }}>
              {fmt(aiGmv)}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>AI-attributed GMV</div>
          </div>
          <div style={{ flex: 1 }} />
          <div>
            <div className="xs-tnum" style={{ fontSize: 18, fontWeight: 700, color: "var(--xs-text)" }}>
              {fmt(Math.round(aiGmv / Math.max(aiDeals.length, 1)))}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>avg order</div>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{
          padding: "8px 14px", borderBottom: "1px solid var(--xs-border-s)",
          display: "flex", gap: 6,
        }}>
          {([["ai", "AI closed"], ["all", "All deals"]] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setDealTab(tab)} style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
              background: dealTab === tab ? "var(--xs-accent-f)" : "transparent",
              border: dealTab === tab ? "1px solid var(--xs-accent-s)" : "1px solid transparent",
              color: dealTab === tab ? "var(--xs-accent-d)" : "var(--xs-text-3)",
              cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Deal rows */}
        <div style={{ padding: "4px 0" }}>
          {visibleDeals.map((d, i) => (
            <div key={i} style={{
              padding: "9px 14px",
              borderBottom: i < visibleDeals.length - 1 ? "1px solid var(--xs-border-s)" : "none",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {/* Status dot */}
              <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: d.source === "ai" ? "var(--xs-good)" : "var(--xs-accent)",
                boxShadow: `0 0 6px ${d.source === "ai" ? "var(--xs-good)" : "var(--xs-accent)"}`,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--xs-text)" }}>
                    {d.user}
                  </span>
                  {d.source === "ai" && (
                    <span style={{
                      fontSize: 9.5, letterSpacing: "0.06em", fontWeight: 600,
                      color: "var(--xs-accent)", textTransform: "uppercase",
                    }}>Nova</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--xs-text-3)", marginTop: 1 }}>
                  {d.product} · {d.variant}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="xs-tnum" style={{ fontSize: 13, fontWeight: 700, color: "var(--xs-text)" }}>
                  ${d.price}
                </div>
                <div className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>
                  {d.minsAgo === 0 ? "just now" : `${d.minsAgo}m ago`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenue Timeline ── */}
      <Section title="Revenue Timeline" badge="last 16 min">
        <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
          {revenue.map((v, i) => {
            const pct = (v / revenueMax) * 100;
            const isRecent = i >= revenue.length - 4;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  height: `${Math.max(pct * 0.6, 4)}px`,
                  background: isRecent
                    ? "linear-gradient(to top, var(--xs-warn), var(--xs-accent-d))"
                    : "var(--xs-surf-2)",
                  border: isRecent ? "none" : "1px solid var(--xs-border-s)",
                  transition: "height 400ms ease",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span className="xs-tnum" style={{ fontSize: 9.5, color: "var(--xs-text-m)" }}>−16 min</span>
          <span className="xs-tnum" style={{ fontSize: 9.5, color: "var(--xs-accent)" }}>now ↑{viral ? "21%" : "12%"}</span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--xs-border-s)" }}>
          <div>
            <div className="xs-tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--xs-text)" }}>
              {fmt(revenue[revenue.length - 1])}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>this minute</div>
          </div>
          <div>
            <div className="xs-tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--xs-good)" }}>
              {fmt(revenue.reduce((a, b) => a + b, 0))}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>last 16 min</div>
          </div>
          <div style={{ flex: 1 }} />
          <div>
            <div className="xs-tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--xs-warn)" }}>
              {fmt(fullGmv)}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>total GMV</div>
          </div>
        </div>
      </Section>

      {/* ── Conversion Funnel ── */}
      <Section title="Conversion Funnel">
        {(
          [
            { label: "Viewers",   val: funnel.views,    base: funnelMax, color: "var(--xs-accent)"  },
            { label: "Engaged",   val: funnel.engaged,  base: funnelMax, color: "var(--xs-accent-d)"},
            { label: "Cart",      val: funnel.cart,     base: funnelMax, color: "var(--xs-warn)"    },
            { label: "Checkout",  val: funnel.checkout, base: funnelMax, color: "var(--xs-warn)"    },
            { label: "Orders",    val: funnel.orders,   base: funnelMax, color: "var(--xs-good)"    },
          ] as const
        ).map(({ label, val, base, color }, i, arr) => {
          const pct = (val / base) * 100;
          const convPct = i > 0 ? ((val / arr[i - 1].val) * 100).toFixed(0) : null;
          return (
            <div key={label} style={{ marginBottom: i < arr.length - 1 ? 8 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, color: "var(--xs-text-2)", fontWeight: 500 }}>{label}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  {convPct && (
                    <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>
                      {convPct}% of prev
                    </span>
                  )}
                  <span className="xs-tnum" style={{ fontSize: 12, fontWeight: 600, color: "var(--xs-text)" }}>
                    {fmtCount(val)}
                  </span>
                </div>
              </div>
              <div style={{
                height: 6, borderRadius: 3, background: "var(--xs-surf-2)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${pct}%`, borderRadius: 3,
                  background: color, transition: "width 600ms ease",
                }} />
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── AI Performance ── */}
      <Section title="AI Performance">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Close Rate",      value: `${aiClosePct}%`,         color: "var(--xs-good)"   },
            { label: "Avg Response",    value: "208ms",                  color: "var(--xs-accent)" },
            { label: "CSAT",            value: "4.9 / 5",                color: "var(--xs-good)"   },
            { label: "Carts Saved",     value: viral ? "284" : "34",     color: "var(--xs-warn)"   },
          ].map(m => (
            <div key={m.label} style={{
              padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--xs-border-s)", background: "var(--xs-bg-el)",
            }}>
              <div className="xs-tnum" style={{ fontSize: 18, fontWeight: 700, color: m.color }}>
                {m.value}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--xs-text-3)", marginTop: 2 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Nova active convo */}
        <div style={{
          marginTop: 12, padding: "10px 12px", borderRadius: 10,
          border: "1px solid var(--xs-accent-s)", background: "var(--xs-accent-f)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--xs-accent-d), var(--xs-accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9.5, fontWeight: 700, color: "#0d1217",
            }}>N</div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--xs-text)" }}>Nova · live convo</span>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--xs-good)" }} />
              <span style={{ fontSize: 10.5, color: "var(--xs-good)" }}>speaking</span>
            </div>
          </div>
          <div className="xs-serif" style={{ fontSize: 13, color: "var(--xs-text)", lineHeight: 1.45, fontStyle: "italic" }}>
            "Medium would give the relaxed fit you're looking for — same as what the host is wearing."
          </div>
          <div style={{ fontSize: 10.5, color: "var(--xs-text-3)", marginTop: 5, display: "flex", gap: 8 }}>
            <span>→ <span style={{ color: "var(--xs-accent)" }}>jen_m</span></span>
            <span className="xs-tnum">208ms latency</span>
          </div>
        </div>
      </Section>

      {/* ── Top Products ── */}
      <Section title="Top Products">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((p, i) => (
            <div key={p.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    background: ["#d4a574,#8a5a3a","#a4b4c4,#5a7a9a","#a4b494,#5a7a5a","#b4a4c4,#7a5a9a"][i],
                    backgroundImage: `linear-gradient(135deg, ${["#d4a574,#8a5a3a","#a4b4c4,#5a7a9a","#a4b494,#5a7a5a","#b4a4c4,#7a5a9a"][i]})`,
                  }} />
                  <span style={{ fontSize: 12, color: "var(--xs-text-2)", fontWeight: 500 }}>{p.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="xs-tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--xs-text)" }}>
                    {fmt(p.gmv)}
                  </span>
                  <span className="xs-tnum" style={{ fontSize: 10.5, color: "var(--xs-text-3)", marginLeft: 6 }}>
                    {fmtCount(p.units)} units
                  </span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: "var(--xs-surf-2)" }}>
                <div style={{
                  height: "100%", width: `${p.pct}%`, borderRadius: 3,
                  background: i === 0
                    ? "linear-gradient(90deg, var(--xs-warn), var(--xs-accent-d))"
                    : "var(--xs-accent-s)",
                  transition: "width 600ms ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Live AI Activity ── */}
      <Section title="Live AI Activity" badge={`${viral ? "412" : "84"}/min`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {aiActs.map((d, i) => {
            const color = toneColor(d.tone);
            return (
              <div key={i} style={{
                padding: "9px 0",
                borderBottom: i < aiActs.length - 1 ? "1px solid var(--xs-border-s)" : "none",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: color, boxShadow: `0 0 6px ${color}`,
                  marginTop: 5, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--xs-text)" }}>{d.k}</span>
                    <span className="xs-tnum" style={{ fontSize: 10, color: "var(--xs-text-3)" }}>{d.t}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--xs-text-2)", marginTop: 1.5, lineHeight: 1.4 }}>{d.v}</div>
                </div>
                <span style={{
                  fontSize: 9.5, color, fontWeight: 700,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                  flexShrink: 0, marginTop: 3,
                }}>{d.tag}</span>
              </div>
            );
          })}
        </div>
      </Section>

    </div>
  );
}
