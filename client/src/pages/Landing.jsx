import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ToolCard from '../components/ToolCard';
import Badge from '../components/Badge';
import { BoltIcon } from '../components/icons';
import { TOOL_LIST } from '../utils/tools';
import { useAuth } from '../hooks/useAuth';

// A self-contained demo that "types" sample outputs token-by-token to showcase
// the streaming concept on the marketing page — no API call, pure animation.
const SAMPLES = [
  {
    label: 'Summarizer',
    text: 'The report argues that remote-first teams ship faster when they default to written, async updates and reserve meetings for genuine decisions.',
  },
  {
    label: 'Paraphraser',
    text: 'Switching to async-first communication helped the team move quicker — writing things down replaced most status meetings entirely.',
  },
  {
    label: 'Generator',
    text: 'Subject: Quick async update\n\nHi team — shipping the new dashboard today. No meeting needed; reply here with blockers and I will jump in.',
  },
];

const TypingDemo = () => {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [text, setText] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    const sample = SAMPLES[sampleIdx];
    const words = sample.text.split(' ');
    let i = 0;
    setText('');

    const tick = () => {
      i += 1;
      setText(words.slice(0, i).join(' '));
      if (i < words.length) {
        timer.current = setTimeout(tick, 55);
      } else {
        // pause on the full sentence, then advance to the next tool
        timer.current = setTimeout(() => setSampleIdx((s) => (s + 1) % SAMPLES.length), 2200);
      }
    };

    timer.current = setTimeout(tick, 350);
    return () => clearTimeout(timer.current);
  }, [sampleIdx]);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
        <span className="ml-2 text-xs font-medium text-white/70">{SAMPLES[sampleIdx].label}</span>
      </div>
      <p className="min-h-[120px] whitespace-pre-wrap text-[15px] leading-relaxed text-white/95">
        {text}
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-[1px] bg-white align-middle animate-blink" />
      </p>
    </div>
  );
};

const FEATURES = [
  {
    title: 'True token streaming',
    body: 'Responses render word-by-word over Server-Sent Events — no spinner-then-dump.',
  },
  {
    title: 'Keys stay server-side',
    body: 'The browser only talks to our Express API. Your provider key never ships to the client.',
  },
  {
    title: 'Usage you can see',
    body: 'Every run is metered. The dashboard charts your activity across tools and days.',
  },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <Badge tone="brand" className="bg-white/15 text-white border-white/20">
              <BoltIcon className="h-3.5 w-3.5" /> Streaming AI tools
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Watch the words
              <br />
              arrive as they think.
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/85">
              Nexus AI is a hub of writing tools — summarize, paraphrase, and generate — that stream
              their answers in real time, the way a model actually produces them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                as={Link}
                to={isAuthenticated ? '/tools' : '/register'}
                size="lg"
                variant="secondary"
                className="border-transparent"
              >
                {isAuthenticated ? 'Open the tools' : 'Start free'}
              </Button>
              <Button
                as={Link}
                to="/tools"
                size="lg"
                className="bg-white/15 text-white hover:bg-white/25 shadow-none"
              >
                Explore tools
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Runs in demo mode with no signup — add a provider key to stream real completions.
            </p>
          </div>

          <div className="animate-fade-up lg:pl-6">
            <TypingDemo />
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Three tools, one stream</h2>
            <p className="mt-1 text-ink-500">Each tool shapes the prompt server-side; you just bring the text.</p>
          </div>
          <Button as={Link} to="/tools" variant="ghost" size="sm" className="hidden sm:inline-flex">
            View all →
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_LIST.map((tool) => (
            <ToolCard key={tool.key} tool={tool} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-ink-100 bg-white">
        <div className="container-page py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 p-6">
                <h3 className="text-base font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
