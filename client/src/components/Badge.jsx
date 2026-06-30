import React from 'react';
import { cx } from '../utils/format';

const TONES = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  neutral: 'bg-ink-100 text-ink-600 border-ink-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warn: 'bg-amber-50 text-amber-700 border-amber-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
};

const Badge = ({ tone = 'neutral', className = '', children }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
      TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
