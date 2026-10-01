export function LockIcon({ size = 18, color = "#1f2430", dot = "#ffd60a" }: { size?: number; color?: string; dot?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="4" y="10" width="16" height="12" rx="3" fill={color} />
      <path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.8" fill={dot} />
    </svg>
  );
}
