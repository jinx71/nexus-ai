import React, { forwardRef } from 'react';
import { cx } from '../utils/format';

const Textarea = forwardRef(
  ({ label, id, error, hint, count, max, className = '', ...rest }, ref) => (
    <div className="w-full">
      {(label || (count !== undefined && max)) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-ink-700">
              {label}
            </label>
          )}
          {count !== undefined && max && (
            <span className={cx('text-xs', count > max ? 'text-red-500' : 'text-ink-400')}>
              {count.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <textarea
        id={id}
        ref={ref}
        className={cx(
          'w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-relaxed text-ink-900 placeholder-ink-400 transition',
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
  )
);

Textarea.displayName = 'Textarea';

export default Textarea;
