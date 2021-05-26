import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { getUsage } from '../api/usage';
import { useAuth } from '../hooks/useAuth';
import { TOOLS } from '../utils/tools';
import { compact, formatMs } from '../utils/format';

const TOOL_COLORS = {
  summarize: '#7152ff',
  paraphrase: '#0ea5e9',
  generate: '#a855f7',
};

const StatCard = ({ label, value, sub }) => (
  <Card className="p-5">
    <p className="text-sm text-ink-500">{label}</p>
    <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
    {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const usage = await getUsage();
      setData(usage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container-page py-12">
        <h1 className="text-3xl font-bold text-ink-900">Usage</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="skeleton h-72 rounded-2xl lg:col-span-2" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
        <div className="mt-10 flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container-page py-12">
        <h1 className="text-3xl font-bold text-ink-900">Usage</h1>
        <Card className="mt-8 p-8 text-center">
          <p className="text-base font-semibold text-ink-900">Couldn’t load your usage</p>
          <p className="mt-1 text-sm text-ink-500">{error}</p>
          <Button onClick={load} className="mt-5">
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  const { totals, byTool, byDay, recent } = data;
  const isEmpty = totals.requests === 0;

  const dayChart = byDay.map((d) => ({ ...d, label: dayjs(d.date).format('MMM D') }));
  const toolChart = byTool.map((t) => ({
    name: TOOLS[t.tool]?.name || t.tool,
    key: t.tool,
    value: t.count,
  }));

  return (
    <div className="container-page py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Usage</h1>
          <p className="mt-1 text-ink-500">
            Signed in as <span className="text-ink-700">{user?.email}</span> · last 14 days
          </p>
        </div>
        <Button as={Link} to="/tools" variant="secondary" size="sm">
          Run a tool →
        </Button>
      </div>

      {isEmpty ? (
        <div className="mt-10">
          <EmptyState
            icon="📊"
            title="No usage yet"
            description="Run any tool and your activity will show up here — requests, characters, and a breakdown by tool."
            action={
              <Button as={Link} to="/tools">
                Open the tools
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total requests" value={totals.requests.toLocaleString()} />
            <StatCard
              label="Characters in"
              value={compact(totals.inputChars)}
              sub={`${totals.inputChars.toLocaleString()} total`}
            />
            <StatCard
              label="Characters out"
              value={compact(totals.outputChars)}
              sub={`${totals.outputChars.toLocaleString()} total`}
            />
          </div>

          {/* Charts */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold text-ink-700">Requests per day</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayChart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeeef5" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#9494b0' }}
                      tickLine={false}
                      axisLine={{ stroke: '#dcdce8' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#9494b0' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f0ff' }}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #eeeef5',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" name="Requests" radius={[6, 6, 0, 0]} fill="#7152ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink-700">By tool</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={toolChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {toolChart.map((entry) => (
                        <Cell key={entry.key} fill={TOOL_COLORS[entry.key] || '#7152ff'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #eeeef5', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {toolChart.map((t) => (
                  <div key={t.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: TOOL_COLORS[t.key] || '#7152ff' }}
                      />
                      {t.name}
                    </span>
                    <span className="font-medium text-ink-800">{t.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent activity */}
          <Card className="mt-6 overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-ink-700">Recent activity</h2>
            </div>
            <ul className="divide-y divide-ink-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge tone="brand">{TOOLS[r.tool]?.name || r.tool}</Badge>
                    <span className="text-ink-500">
                      {r.inputChars.toLocaleString()} → {r.outputChars.toLocaleString()} chars
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-400">
                    <span>{formatMs(r.ms)}</span>
                    <span>{dayjs(r.createdAt).format('MMM D, HH:mm')}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
