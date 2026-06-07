import type { ReactNode } from "react";
import type { PerkIconName } from "./perkIconNames";

export const PERK_ICONS: Record<PerkIconName, ReactNode> = {
  "steady-hand": (
    <>
      <path d="M9 13V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M12 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M15 11V7a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6 6 6 0 0 1-4.2-1.7l-3-3a1.6 1.6 0 0 1 2.3-2.2L9 13" />
    </>
  ),
  "bigger-targets": (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
    </>
  ),
  balanced: (
    <>
      <path d="M12 5v14" />
      <path d="M8 19h8" />
      <path d="M5 8h14" />
      <path d="M5 8 2.5 12.5a3 3 0 0 0 5 0L5 8z" />
      <path d="M19 8l-2.5 4.5a3 3 0 0 0 5 0L19 8z" />
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  "alert-triangle": (
    <>
      <path d="M12 4 2.5 20h19L12 4z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  crack: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6l7-3z" />
      <path d="M12 6l-2 5h3l-2 5" />
    </>
  ),
  hourglass: (
    <>
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M8 3v3l4 6 4-6V3" />
      <path d="M8 21v-3l4-6 4 6v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  "trending-up": (
    <>
      <polyline points="3 17 9 11 13 15 21 6" />
      <polyline points="15 6 21 6 21 12" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.5.7-3 2-4 .3 1 1 1.7 1.7 2C10.5 8 11 5 12 3z" />
    </>
  ),
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  star: (
    <>
      <polygon points="12 3 14.6 8.8 21 9.3 16 13.6 17.6 20 12 16.4 6.4 20 8 13.6 3 9.3 9.4 8.8" />
    </>
  ),
  gem: (
    <>
      <path d="M5 4h14l3 5-10 11L2 9l3-5z" />
      <path d="M2 9h20" />
      <path d="M9 4l3 16 3-16" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
      <path d="M5 12v3c0 1.7 3.1 3 7 3s7-1.3 7-3v-3" />
    </>
  ),
  stairs: (
    <>
      <polyline points="3 20 3 16 9 16 9 11 15 11 15 6 21 6" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.2a4 4 0 1 0 0 5.6" />
    </>
  ),
  burst: (
    <>
      <path d="M12 2l2 5 5-2-2 5 5 2-5 2 2 5-5-2-2 5-2-5-5 2 2-5-5-2 5-2-2-5 5 2 2-5z" />
    </>
  ),
  sunrise: (
    <>
      <path d="M3 18h18" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="M12 5v3M5.5 8.5 7 10M18.5 8.5 17 10M2 14h2M20 14h2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6l7-3z" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8a4.6 4.6 0 0 1 6.5 6.5L12 20.3z" />
    </>
  ),
  "heart-plus": (
    <>
      <path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8a4.6 4.6 0 0 1 6.5 6.5L12 20.3z" />
      <path d="M12 10v4M10 12h4" />
    </>
  ),
  wheat: (
    <>
      <path d="M12 21V8" />
      <path d="M12 8c0-2 2-3 3-4-1 2-1 3-3 4z" />
      <path d="M12 8c0-2-2-3-3-4 1 2 1 3 3 4z" />
      <path d="M12 13c0-2 2-3 3-4-1 2-1 3-3 4z" />
      <path d="M12 13c0-2-2-3-3-4 1 2 1 3 3 4z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11 3l1.6 5.4L18 10l-5.4 1.6L11 17l-1.6-5.4L4 10l5.4-1.6L11 3z" />
      <path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7z" />
    </>
  ),
  "shield-heart": (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6l7-3z" />
      <path d="M12 15.4 9.2 12.8a1.9 1.9 0 0 1 2.6-2.7l.2.2.2-.2a1.9 1.9 0 0 1 2.6 2.7L12 15.4z" />
    </>
  ),
  "circle-plus": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  shuffle: (
    <>
      <path d="M4 7h3l10 10h3" />
      <path d="M4 17h3l3-3M14 10l3-3h3" />
      <polyline points="18 4 21 7 18 10" />
      <polyline points="18 14 21 17 18 20" />
    </>
  ),
  bomb: (
    <>
      <circle cx="11" cy="14" r="7" />
      <path d="M16 9l2.5-2.5M18.5 6.5H21M18.5 6.5V4" />
    </>
  ),
  clover: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="15" cy="9" r="3" />
      <circle cx="9" cy="15" r="3" />
      <circle cx="15" cy="15" r="3" />
      <path d="M14 16l5 5" />
    </>
  ),
  mask: (
    <>
      <path d="M5 5c4-1 10-1 14 0 0 6-2 13-7 13S5 11 5 5z" />
      <path d="M8.5 9.5c.8-.6 2-.6 2.8 0M12.7 9.5c.8-.6 2-.6 2.8 0" />
      <path d="M9.5 14c1.5 1.2 3.5 1.2 5 0" />
    </>
  ),
  wave: (
    <>
      <path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </>
  ),
  bank: (
    <>
      <path d="M3 9l9-5 9 5" />
      <path d="M4 9h16" />
      <path d="M5 9v8M9 9v8M15 9v8M19 9v8" />
      <path d="M3 20h18" />
    </>
  ),
  magnet: (
    <>
      <path d="M6 3v8a6 6 0 0 0 12 0V3" />
      <line x1="6" y1="3" x2="10" y2="3" />
      <line x1="14" y1="3" x2="18" y2="3" />
      <line x1="6" y1="7" x2="10" y2="7" />
      <line x1="14" y1="7" x2="18" y2="7" />
    </>
  ),
  cyclone: (
    <>
      <path d="M4 6h16" />
      <path d="M6 10h12" />
      <path d="M8 14h8" />
      <path d="M10 18h4" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z" />
      <path d="M12 11c0-2.5 2-4.5 5-4.5 0 2.5-2 4.5-5 4.5z" />
    </>
  ),
  beacon: (
    <>
      <path d="M8 20h8" />
      <path d="M8 20v-6a4 4 0 0 1 8 0v6" />
      <path d="M12 6V3M6.5 8 5 6.5M17.5 8 19 6.5" />
      <circle cx="12" cy="11" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  converge: (
    <>
      <polyline points="9 5 9 9 5 9" />
      <polyline points="15 5 15 9 19 9" />
      <polyline points="9 19 9 15 5 15" />
      <polyline points="15 19 15 15 19 15" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  ghost: (
    <>
      <path d="M5 20v-9a7 7 0 0 1 14 0v9l-2.3-2-2.3 2-2.4-2-2.3 2L5 20z" />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  repeat: (
    <>
      <polyline points="7 4 4 7 7 10" />
      <path d="M4 7h13a3 3 0 0 1 3 3v1" />
      <polyline points="17 20 20 17 17 14" />
      <path d="M20 17H7a3 3 0 0 1-3-3v-1" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <polygon points="15.5 8.5 10.5 10.5 8.5 15.5 13.5 13.5" />
    </>
  ),
  mirror: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2.5" />
      <path d="M9 6 4 12l5 6V6z" />
      <path d="M15 6l5 6-5 6V6z" />
    </>
  ),
  stopwatch: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 13.5V9.5" />
      <path d="M10 3h4" />
      <path d="M12 3v3" />
      <path d="M18 7.5 19.5 6" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="6.5" rx="2" ry="3" />
      <ellipse cx="12" cy="17.5" rx="2" ry="3" />
      <ellipse cx="6.5" cy="12" rx="3" ry="2" />
      <ellipse cx="17.5" cy="12" rx="3" ry="2" />
    </>
  ),
  frame: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.2" />
    </>
  ),
  "hourglass-bottom": (
    <>
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M8 3v3l4 6 4-6V3" />
      <path d="M8 21v-3l4-6 4 6v3" />
      <path d="M9 21h6l-3-4.2z" fill="currentColor" stroke="none" />
    </>
  ),
  "trending-up-2": (
    <>
      <polyline points="3 12 8 7 12 11 20 4" />
      <polyline points="15 4 20 4 20 9" />
      <polyline points="3 20 8 15 12 19 20 12" />
    </>
  ),
  diamond: (
    <>
      <path d="M12 2 22 12 12 22 2 12 12 2z" />
      <path d="M12 2 8 12l4 10" />
      <path d="M12 2l4 10-4 10" />
    </>
  ),
  "first-aid-kit": (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V7" />
      <path d="M12 11v5M9.5 13.5h5" />
    </>
  ),
  "flame-heart": (
    <>
      <path d="M12 20.6 5 13.6a4.4 4.4 0 0 1 6.2-6.2l.8.8.8-.8a4.4 4.4 0 0 1 6.2 6.2L12 20.6z" />
      <path
        d="M12 16.5c1.6-1 2.4-2.1 2.4-3.4 0-1.2-.8-2.1-1.5-2.7.1.8-.3 1.3-.9 1.7-.6-.7-.5-1.6-.2-2.3-1.1.6-2.1 1.7-2.1 3.1 0 1.4.7 2.5 2.3 3.5z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  lightning: (
    <>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </>
  ),
  skull: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0v2.6c0 1-.6 1.9-1.5 2.3V19a1 1 0 0 1-1 1h-9A1 1 0 0 1 6.5 19v-3.1C5.6 15.5 5 14.6 5 13.6V11z" />
      <circle cx="9.2" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 14.5v2.5M9.5 20v-2M14.5 20v-2" />
    </>
  ),
  tornado: (
    <>
      <path d="M4 5c4 2 12 2 16 0" />
      <path d="M6 9c3 1.4 9 1.4 12 0" />
      <path d="M8 13c2 1 6 1 8 0" />
      <path d="M10.5 17c1 .6 3 .6 4 0" />
      <path d="M12.5 20.5c.5.3 1.3 0 1.5-.6" />
    </>
  ),
  locked: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  fallback: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2.5 2-2.5 3.5" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
};
