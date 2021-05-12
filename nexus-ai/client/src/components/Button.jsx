import React from 'react';
import { cx } from '../utils/format';

const VARIANTS = {
  primary:
    'bg-brand-gradient text-white shadow-soft hover:opacity-95 active:opacity-90 disabled:opacity-50',
  secondary:
    'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 active:bg-ink-100 disabled:opacity-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 disabled:opacity-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  disabled = false,
  children,
  ...rest
}) => (
  <Tag
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition',
      'disabled:cursor-not-allowed',
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      className
    )}
    disabled={Tag === 'button' ? disabled : undefined}
    {...rest}
  >
    {children}
  </Tag>
);

export default Button;
