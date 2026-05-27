import React, { useId } from "react";

interface XMarkProps {
  size?: number;
  live?: boolean;
  style?: React.CSSProperties;
}

export function XMark({ size = 32, live = true, style }: XMarkProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `xBodyGrad-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} aria-label="XStream">
      <defs>
        <linearGradient id={gradId} x1="14" y1="14" x2="86" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0"    stopColor="var(--xs-accent-d)"/>
          <stop offset="0.55" stopColor="var(--xs-accent)"/>
          <stop offset="1"    stopColor="var(--xs-accent-2)"/>
        </linearGradient>
      </defs>
      {/* outer broadcast rings */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${gradId})`} strokeWidth="2" opacity="0.35"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke={`url(#${gradId})`} strokeWidth="2" opacity="0.6"/>
      {/* solid disc */}
      <circle cx="50" cy="50" r="30" fill={`url(#${gradId})`}/>
      {/* X glyph */}
      <path d="M38 38 L62 62 M62 38 L38 62" stroke="#f6f2ea" strokeWidth="4" strokeLinecap="round" opacity="0.96"/>
      {/* live dot */}
      {live && (
        <circle cx="82" cy="20" r="6" fill="var(--xs-warn)">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  );
}
