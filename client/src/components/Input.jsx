import React, { forwardRef } from 'react';
import { cx } from '../utils/format';

const Input = forwardRef(({ label, id, error, hint, className = '', ...rest }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
    )}
    <input
      id={id}
      ref={ref}
      className={cx(
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-400 transition',
        'focus:border-brand-500 focus:ring-2 focus:ring-brand-200',
        error ? 'border-red-400' : 'border-ink-200',
        className
      )}
      aria-invalid={Boolean(error)}
      {...rest}
    />
    {error ? (
      <p className="mt-1.5 text-xs text-red-500">{error}</p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
    )}
  </div>
));

Input.displayName = 'Input';

export default Input;
