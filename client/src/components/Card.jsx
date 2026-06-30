import React from 'react';
import { cx } from '../utils/format';

const Card = ({ className = '', children, ...rest }) => (
  <div
    className={cx('rounded-2xl border border-ink-100 bg-white shadow-card', className)}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
