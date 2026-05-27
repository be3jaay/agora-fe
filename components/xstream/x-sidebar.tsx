"use client";

import React from "react";
import { XMark } from "./x-mark";
import { XIcon } from "./x-icon";

const NAV_ITEMS = [
  { id: "stream",      label: "Live now",   icon: "broadcast" as const, live: true  },
  { id: "catalog",     label: "Catalog",    icon: "catalog"   as const              },
  { id: "agents",      label: "Agents",     icon: "agents"    as const              },
  { id: "audience",    label: "Audiences",  icon: "audience"  as const              },
  { id: "conversions", label: "Conversions",icon: "conversions" as const            },
  { id: "library",     label: "Library",    icon: "library"   as const              },
];

const ACTIVE_AGENTS = [
  { label: "Sales · Nova",       color: "var(--xs-accent)", count: 1842 },
  { label: "Support · Iris",     color: "var(--xs-good)",   count: 612  },
  { label: "Concierge · Eta",    color: "var(--xs-warn)",   count: 188  },
];

interface XSidebarProps {
  active?: string;
}

export function XSidebar({ active = "stream" }: XSidebarProps) {
  return (
    <div style={{
      width: 220, height: "100%",
      background: "var(--xs-bg-el)",
      borderRight: "1px solid var(--xs-border-s)",
      display: "flex", flexDirection: "column",
      padding: "20px 14px", flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
        <XMark size={24}/>
        <span style={{
          fontFamily: "'Manrope', 'Inter', sans-serif",
          fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em",
          color: "var(--xs-text)",
        }}>XStream</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--xs-text-3)", letterSpacing: "0.08em" }}>⌘K</span>
      </div>

      {/* Operator card */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 8px", marginBottom: 16,
        borderRadius: 10, background: "var(--xs-surf-2)",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, #c8a98a, #8a6a52)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 11, fontWeight: 600, flexShrink: 0,
        }}>MS</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--xs-text)" }}>Maren Studio</div>
          <div style={{ fontSize: 10.5, color: "var(--xs-text-3)" }}>Operator · live</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "8px 10px", borderRadius: 8,
              color: isActive ? "var(--xs-text)" : "var(--xs-text-2)",
              background: isActive ? "var(--xs-surf-2)" : "transparent",
              fontSize: 13, fontWeight: isActive ? 500 : 400,
              cursor: "pointer", transition: "all 140ms",
            }}>
              <XIcon name={item.icon} size={15} style={{ opacity: isActive ? 0.95 : 0.62 }}/>
              <span>{item.label}</span>
              {item.live && (
                <span style={{
                  marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 10, color: "var(--xs-warn)", letterSpacing: "0.06em", fontWeight: 600,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--xs-warn)", boxShadow: "0 0 6px var(--xs-warn)",
                  }}/>
                  LIVE
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Active agents */}
      <div style={{ marginTop: 22, padding: "0 10px" }}>
        <div className="xs-eyebrow" style={{ marginBottom: 10 }}>Active agents</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12.5 }}>
          {ACTIVE_AGENTS.map(a => (
            <div key={a.label} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "6px 8px", borderRadius: 7, color: "var(--xs-text-2)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: a.color, flexShrink: 0 }}/>
              <span style={{ flex: 1 }}>{a.label}</span>
              <span className="xs-tnum" style={{ fontSize: 11, color: "var(--xs-text-3)" }}>
                {a.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Settings */}
      <div style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: "8px 10px", borderRadius: 8,
        color: "var(--xs-text-2)", fontSize: 13, cursor: "pointer",
      }}>
        <XIcon name="settings" size={15} style={{ opacity: 0.62 }}/>
        Settings
      </div>
    </div>
  );
}
