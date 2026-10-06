import type { TrickKind } from "../game/tricks";

/** Tiny vector glyphs for the trick list (no emoji fonts needed). */
export function TrickIcon({ kind, size = 22, color = "#1f2430" }: { kind: TrickKind; size?: number; color?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "kickflip":
      return (
        <svg {...common}>
          <rect x="4" y="9" width="16" height="4" rx="2" transform="rotate(-25 12 11)" />
          <path d="M6 19a7 7 0 0 0 12 0" />
          <path d="M18 19l1.5-2.5M18 19l-2.8-.6" />
        </svg>
      );
    case "heelflip":
      return (
        <svg {...common}>
          <rect x="4" y="9" width="16" height="4" rx="2" transform="rotate(25 12 11)" />
          <path d="M18 19a7 7 0 0 1-12 0" />
          <path d="M6 19l-1.5-2.5M6 19l2.8-.6" />
        </svg>
      );
    case "shuvit":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="4" rx="2" />
          <path d="M4 5c4 3 12 3 16 0" />
          <path d="M20 5l-.5 3M20 5l-3 .3" />
        </svg>
      );
    case "spinL":
      return (
        <svg {...common}>
          <path d="M19 12a7 7 0 1 1-2.1-5" />
          <path d="M17 3v4h-4" />
        </svg>
      );
    case "spinR":
      return (
        <svg {...common}>
          <path d="M5 12a7 7 0 1 0 2.1-5" />
          <path d="M7 3v4h4" />
        </svg>
      );
    case "method":
      return (
        <svg {...common}>
          <rect x="3" y="14" width="14" height="4" rx="2" transform="rotate(-35 10 16)" />
          <path d="M14 9c1.5-3 4-4 6-3" />
          <circle cx="17" cy="5" r="2" />
        </svg>
      );
    case "indy":
      return (
        <svg {...common}>
          <rect x="5" y="15" width="14" height="4" rx="2" />
          <path d="M12 15V9" />
          <path d="M9 6a3 3 0 0 1 6 0" />
        </svg>
      );
    case "impossible":
      return (
        <svg {...common}>
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          <path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" strokeWidth={1.6} />
        </svg>
      );
    case "wingflap":
      return (
        <svg {...common}>
          <path d="M12 13c-2-5-6-7-9-6 2 4 5 6 9 6z" />
          <path d="M12 13c2-5 6-7 9-6-2 4-5 6-9 6z" />
          <path d="M12 13v6" />
        </svg>
      );
    case "coo540":
      return (
        <svg {...common}>
          <path d="M12 21c-4 0-7-3-7-7 0-3 2-5 4-7 0 2 1 3 2 3 0-3 1-6 4-8 0 3 4 5 4 10 0 5-3 9-7 9z" />
        </svg>
      );
    /* ===== 20 GAYA BARU ===== */
    case "varial":
      return (
        <svg {...common}>
          <rect x="4" y="13" width="16" height="4" rx="2" transform="rotate(-18 12 15)" />
          <path d="M6 9a7 7 0 0 1 12 0" />
          <path d="M18 9l1.5-2.6M18 9l-2.9-.4" />
        </svg>
      );
    case "inward":
      return (
        <svg {...common}>
          <rect x="4" y="13" width="16" height="4" rx="2" transform="rotate(18 12 15)" />
          <path d="M18 9a7 7 0 0 0-12 0" />
          <path d="M6 9L4.5 6.4M6 9l2.9-.4" />
        </svg>
      );
    case "hardflip":
      return (
        <svg {...common}>
          <rect x="4" y="14" width="16" height="4" rx="2" transform="rotate(-30 12 16)" />
          <path d="M7 5c5 5 5 6 10 7" />
          <path d="M17 12l-3.2.2M17 12l-1-3" />
        </svg>
      );
    case "fingerflip":
      return (
        <svg {...common}>
          <rect x="5" y="15" width="14" height="3.6" rx="1.8" />
          <path d="M12 13V6" />
          <path d="M9 8l3-2.6L15 8" />
          <path d="M7 4a4.5 4.5 0 0 0 0 6" strokeWidth={1.8} />
        </svg>
      );
    case "pressure":
      return (
        <svg {...common}>
          <rect x="5" y="14" width="14" height="3.6" rx="1.8" />
          <path d="M12 4v7" />
          <path d="M9.5 8.8L12 11l2.5-2.2" />
          <path d="M6 5a6.5 6.5 0 0 1 12 0" strokeWidth={1.6} />
        </svg>
      );
    case "dblflip":
      return (
        <svg {...common}>
          <rect x="5" y="15" width="14" height="3.6" rx="1.8" />
          <path d="M7 12a5 5 0 0 1 10 0" />
          <path d="M8 5a5.5 5.5 0 0 1 8 0" />
          <path d="M16 5l1.6-2M16 5h-3" />
        </svg>
      );
    case "hospital":
      return (
        <svg {...common}>
          <rect x="5" y="15" width="14" height="3.6" rx="1.8" />
          <path d="M8 12V8a4 4 0 0 1 8 0v4" />
          <path d="M16 12l1.8 1.6M16 12l-2.7.9" />
        </svg>
      );
    case "treflip":
      return (
        <svg {...common}>
          <path d="M12 21a7.5 7.5 0 1 1 6-3" />
          <path d="M18 18h-4v-3.6" strokeWidth={1.8} />
          <path d="M12 10l1.4 3.8H9.6L11 15l1 3 1-3 1.4-1.2h-3.8z" strokeWidth={1.8} />
        </svg>
      );
    case "laser":
      return (
        <svg {...common}>
          <path d="M12 3l1.5 4.6L18 9l-4.5 1.4L12 15l-1.5-4.6L6 9l4.5-1.4z" />
          <path d="M18 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" strokeWidth={1.6} />
        </svg>
      );
    case "shifty":
      return (
        <svg {...common}>
          <path d="M13 3L7 12h4l-2 9 8-11h-5l3-7z" />
        </svg>
      );
    case "bigspin":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 1 1-2.4-5.7" />
          <path d="M17.6 2.5v4h-4" />
          <rect x="8" y="14" width="9" height="3" rx="1.5" strokeWidth={1.6} />
        </svg>
      );
    case "gazelle":
      return (
        <svg {...common}>
          <path d="M4 16c2-7 6-10 10-10" />
          <path d="M14 6h4v4" />
          <path d="M20 16c-1.5 4-5 6-9 5" />
          <path d="M11 21l-4-.3.5-4" />
        </svg>
      );
    case "air720":
      return (
        <svg {...common}>
          <path d="M12 21c-4 0-7-3-7-7 0-3 2-5 4-7 0 2 1 3 2 3 0-3 1-6 4-8 0 3 4 5 4 10 0 5-3 9-7 9z" />
          <path d="M9.5 13.5a2.6 2.6 0 1 1 2.5 3.4" strokeWidth={1.6} />
        </svg>
      );
    case "melon":
      return (
        <svg {...common}>
          <rect x="4" y="14" width="14" height="4" rx="2" transform="rotate(-28 11 16)" />
          <path d="M13 10c2-4 5-5 7-4a5 5 0 0 1-6 6z" />
        </svg>
      );
    case "nosegrab":
      return (
        <svg {...common}>
          <rect x="3" y="13" width="16" height="4" rx="2" transform="rotate(-22 11 15)" />
          <circle cx="17.5" cy="9.5" r="2.4" />
          <path d="M14 11l-2.5 2.4" strokeWidth={1.8} />
        </svg>
      );
    case "tailgrab":
      return (
        <svg {...common}>
          <rect x="5" y="13" width="16" height="4" rx="2" transform="rotate(22 13 15)" />
          <circle cx="6.5" cy="11.5" r="2.4" />
          <path d="M9.5 12l2 2" strokeWidth={1.8} />
        </svg>
      );
    case "stalefish":
      return (
        <svg {...common}>
          <path d="M4 12c3-4 8-4 11 0-3 4-8 4-11 0z" />
          <path d="M15 12l4-3v6z" />
          <circle cx="7" cy="11" r="0.9" strokeWidth={1.6} />
        </svg>
      );
    case "benihana":
      return (
        <svg {...common}>
          <path d="M12 4v5M12 4l-2 2M12 4l2 2" />
          <path d="M8 9l-3 4M16 9l3 4" />
          <rect x="6" y="16" width="12" height="3.4" rx="1.7" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...common}>
          <path d="M12 3c2.8 1.8 4 5 4 8l-4 3-4-3c0-3 1.2-6.2 4-8z" />
          <path d="M8 11L6 15l3-1M16 11l2 4-3-1M12 14v5" />
          <path d="M12 19l-1.4 2h2.8z" strokeWidth={1.6} />
        </svg>
      );
    case "christ":
      return (
        <svg {...common}>
          <path d="M4 8h16" />
          <path d="M12 8v9" />
          <ellipse cx="12" cy="5" rx="2.4" ry="1.2" strokeWidth={1.8} />
          <rect x="8" y="16.6" width="8" height="3" rx="1.5" strokeWidth={1.8} />
        </svg>
      );
  }
}
