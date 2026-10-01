export function BreadIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
      {/* 3D Voxel Bread Loaf / Golden Block */}
      {/* Top Diamond Face */}
      <polygon points="14,3.5 24.5,9.5 14,15.5 3.5,9.5" fill="#ffe043" />
      {/* Left Shaded Face */}
      <polygon points="3.5,9.5 14,15.5 14,24.5 3.5,18.5" fill="#d97706" />
      {/* Right Lit Face */}
      <polygon points="14,15.5 24.5,9.5 24.5,18.5 14,24.5" fill="#f59e0b" />
      {/* Crust score indent on top */}
      <polygon points="10,8 17,12 16,12.8 9,8.8" fill="#fff59d" />
      <polygon points="7.5,9.5 12,12 11.2,12.6 6.7,10.1" fill="#fff59d" />
    </svg>
  );
}
