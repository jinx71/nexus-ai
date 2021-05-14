import React from 'react';
import { Link } from 'react-router-dom';
import { NexusMark } from './icons';

const Footer = () => (
  <footer className="mt-16 border-t border-ink-100 bg-white">
    <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
      <div className="flex items-center gap-2">
        <NexusMark className="h-6 w-6" />
        <span className="text-sm text-ink-500">
          Nexus AI — a MERN portfolio project on streaming LLM responses.
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-ink-500">
        <Link to="/tools" className="hover:text-ink-800">
          Tools
        </Link>
        <a
          href="https://groq.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-ink-800"
        >
          Powered by your provider
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
