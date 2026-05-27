import React from "react";

type IconName =
  | "broadcast" | "video" | "catalog" | "agents" | "audience"
  | "conversions" | "library" | "settings" | "play" | "pause"
  | "mic" | "heart" | "bolt" | "clock" | "sparkle" | "send"
  | "search" | "cart" | "fire" | "users" | "arrow-up" | "arrow-right"
  | "check" | "dot" | "x" | "plus" | "more" | "command" | "globe"
  | "shield";

interface XIconProps {
  name: IconName;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function XIcon({ name, size = 16, style, className }: XIconProps) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    style, className,
  };
  switch (name) {
    case "broadcast":
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M5.6 5.6a9 9 0 000 12.8M18.4 5.6a9 9 0 010 12.8M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7"/></svg>;
    case "video":
      return <svg {...props}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>;
    case "catalog":
      return <svg {...props}><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "agents":
      return <svg {...props}><path d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7l8-4z"/><circle cx="12" cy="11" r="2"/><path d="M8 17c1-2 2-3 4-3s3 1 4 3"/></svg>;
    case "audience":
      return <svg {...props}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M15 18c0-2 2-4 4-4"/></svg>;
    case "conversions":
      return <svg {...props}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
    case "library":
      return <svg {...props}><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 4l4 1-3 14-4-1z"/></svg>;
    case "settings":
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19 12c0-.5-.1-1-.2-1.5l2-1.6-2-3.4-2.4 1c-.7-.5-1.5-.9-2.4-1.2L13.5 3h-3l-.5 2.3c-.9.3-1.7.7-2.4 1.2L5.2 5.5l-2 3.4 2 1.6c-.1.5-.2 1-.2 1.5s.1 1 .2 1.5l-2 1.6 2 3.4 2.4-1c.7.5 1.5.9 2.4 1.2L10.5 21h3l.5-2.3c.9-.3 1.7-.7 2.4-1.2l2.4 1 2-3.4-2-1.6c.1-.5.2-1 .2-1.5z"/></svg>;
    case "play":
      return <svg {...props} strokeWidth={0}><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg>;
    case "pause":
      return <svg {...props} strokeWidth={0}><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>;
    case "mic":
      return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/></svg>;
    case "heart":
      return <svg {...props}><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>;
    case "bolt":
      return <svg {...props} strokeWidth={0}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg>;
    case "clock":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "sparkle":
      return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case "send":
      return <svg {...props}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>;
    case "cart":
      return <svg {...props}><path d="M3 4h2l2 12h12l2-8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>;
    case "fire":
      return <svg {...props}><path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7-1 2-3 2-3-1V3c-3 2-7 6-7 11s3 8 7 8z"/></svg>;
    case "users":
      return <svg {...props}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M15 18c0-2 2-4 4-4"/></svg>;
    case "arrow-up":
      return <svg {...props}><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case "arrow-right":
      return <svg {...props}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
    case "check":
      return <svg {...props}><path d="M5 12l5 5 9-11"/></svg>;
    case "dot":
      return <svg {...props}><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>;
    case "x":
      return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "plus":
      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "more":
      return <svg {...props}><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></svg>;
    case "command":
      return <svg {...props}><path d="M9 6a3 3 0 11-3 3h12a3 3 0 11-3-3v12a3 3 0 113-3H6a3 3 0 113 3V6z"/></svg>;
    case "globe":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>;
    case "shield":
      return <svg {...props}><path d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7l8-4z"/></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="6"/></svg>;
  }
}
