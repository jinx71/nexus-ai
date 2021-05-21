import React from 'react';
import { Link } from 'react-router-dom';
import { ToolIcon } from './icons';
import { cx } from '../utils/format';

const ToolCard = ({ tool }) => (
  <Link
    to={`/tools/${tool.key}`}
    className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
  >
    <div
      className={cx(
        'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
        tool.accent
      )}
    >
      <ToolIcon name={tool.key} />
    </div>
    <h3 className="text-lg font-semibold text-ink-900">{tool.name}</h3>
    <p className="mt-1 flex-1 text-sm text-ink-500">{tool.blurb}</p>
    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
      Open tool
      <svg
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  </Link>
);

export default ToolCard;
