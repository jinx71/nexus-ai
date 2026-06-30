import React from 'react';

// Lightweight inline icons (stroke = currentColor) so no icon library is needed.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const ToolIcon = ({ name, className = 'h-6 w-6' }) => {
  const paths = {
    summarize: (
      <>
        <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v5h5" />
        <path d="M8 13h7M8 16.5h7M8 9.5h2" />
      </>
    ),
    paraphrase: (
      <>
        <path d="M4 8h11l-2.5-2.5M20 16H9l2.5 2.5" />
      </>
    ),
    generate: (
      <>
        <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3Z" />
        <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
      </>
    ),
  };

  return (
    <svg {...base} className={className} aria-hidden="true">
      {paths[name] || paths.generate}
    </svg>
  );
};

export const NexusMark = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="nexusMarkG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7152ff" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#nexusMarkG)" />
    <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 44 V20 L44 44 V20" />
    </g>
    <circle cx="20" cy="20" r="4" fill="#fff" />
    <circle cx="44" cy="44" r="4" fill="#fff" />
  </svg>
);

export const CopyIcon = ({ className = 'h-4 w-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
);

export const CheckIcon = ({ className = 'h-4 w-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M4 12.5l5 5L20 6" />
  </svg>
);

export const BoltIcon = ({ className = 'h-4 w-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);
