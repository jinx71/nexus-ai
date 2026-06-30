// Tiny classnames joiner (no clsx dependency needed).
export const cx = (...parts) => parts.filter(Boolean).join(' ');

// Human-friendly large numbers: 1240 -> "1.2k"
export const compact = (n) => {
  if (n === null || n === undefined) return '0';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
};

// "1.4s" / "820ms" from milliseconds
export const formatMs = (ms) => {
  if (!ms && ms !== 0) return '—';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
};
