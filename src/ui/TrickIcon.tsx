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
  }
}
