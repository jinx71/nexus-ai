import React from 'react';
import { cx } from '../utils/format';

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]' };

const Spinner = ({ size = 'md', className = '', label = 'Loading' }) => (
  <span role="status" aria-label={label} className="inline-flex">
    <span
      className={cx(
        'animate-spin rounded-full border-brand-200 border-t-brand-500',
        SIZES[size],
        className
      )}
    />
  </span>
);

export default Spinner;
