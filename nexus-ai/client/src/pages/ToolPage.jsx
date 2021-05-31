import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import Spinner from '../components/Spinner';
import StreamOutput from '../components/StreamOutput';
import { ToolIcon } from '../components/icons';
import { getTool } from '../utils/tools';
import { useStream } from '../hooks/useStream';
import { cx } from '../utils/format';

const MAX_INPUT = 8000;

const buildDefaults = (tool) =>
  (tool.options || []).reduce((acc, opt) => {
    acc[opt.name] = opt.default;
    return acc;
  }, {});

const ToolPage = () => {
  const { tool: toolKey } = useParams();
  const tool = getTool(toolKey);

  const [input, setInput] = useState('');
  const [options, setOptions] = useState(() => (tool ? buildDefaults(tool) : {}));
  const { output, isStreaming, error, done, start, stop, reset } = useStream();

  // Reset everything when navigating between tools.
  useEffect(() => {
    if (tool) {
      setInput('');
      setOptions(buildDefaults(tool));
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolKey]);

  const tooLong = input.length > MAX_INPUT;
  const canRun = input.trim().length > 0 && !tooLong && !isStreaming;

  const inputError = useMemo(() => {
    if (tooLong) return `Input is too long (max ${MAX_INPUT.toLocaleString()} characters).`;
    return undefined;
  }, [tooLong]);

  if (!tool) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Unknown tool</h1>
        <p className="mt-2 text-ink-500">That tool doesn’t exist.</p>
        <Button as={Link} to="/tools" className="mt-6">
          Back to tools
        </Button>
      </div>
    );
  }

  const handleRun = () => {
    if (!canRun) return;
    start(tool.key, { input: input.trim(), options });
  };

  const setOption = (name, value) => setOptions((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-400">
        <Link to="/tools" className="hover:text-ink-700">
          Tools
        </Link>
        <span>/</span>
        <span className="text-ink-700">{tool.name}</span>
      </div>

      <div className="mb-8 flex items-start gap-4">
        <div
          className={cx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
            tool.accent
          )}
        >
          <ToolIcon name={tool.key} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{tool.name}</h1>
          <p className="mt-1 text-ink-500">{tool.tagline}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input column */}
        <Card className="flex flex-col p-5">
          <Textarea
            id="tool-input"
            label="Your text"
            rows={12}
            placeholder={tool.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            count={input.length}
            max={MAX_INPUT}
            error={inputError}
          />

          {tool.options && tool.options.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {tool.options.map((opt) => (
                <div key={opt.name} className="min-w-[150px]">
                  <label
                    htmlFor={`opt-${opt.name}`}
                    className="mb-1.5 block text-sm font-medium text-ink-700"
                  >
                    {opt.label}
                  </label>
                  <select
                    id={`opt-${opt.name}`}
                    value={options[opt.name]}
                    onChange={(e) => setOption(opt.name, e.target.value)}
                    className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  >
                    {opt.values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            {isStreaming ? (
              <Button variant="danger" onClick={stop} size="lg">
                <Spinner size="sm" className="border-white/40 border-t-white" /> Stop
              </Button>
            ) : (
              <Button onClick={handleRun} disabled={!canRun} size="lg">
                {tool.cta}
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setInput('');
                reset();
              }}
              disabled={isStreaming || (!input && !output)}
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Output column */}
        <div className="min-h-[420px]">
          <StreamOutput output={output} isStreaming={isStreaming} error={error} done={done} />
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
