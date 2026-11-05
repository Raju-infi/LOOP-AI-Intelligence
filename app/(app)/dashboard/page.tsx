
'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  MessageSquare,
  Activity,
  TrendingUp,
  ThumbsUp,
  Minus,
  ThumbsDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

type Analytics = {
  total?: number;
  negativePct?: number;
  newThisWeek?: number;
  topThemes?: { name: string; count: number }[];
  volume?: { date: string; count: number }[];
  sentiment?: {
    POS?: number;
    NEU?: number;
    NEG?: number;
  };
};

export default function Dashboard() {
  const [d, setD] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(async (r) => {
        if (!r.ok) throw new Error('Unable to load analytics');
        return r.json();
      })
      .then(setD)
      .catch(() => setError('Unable to load dashboard data. Please refresh.'));
  }, []);

  if (error) {
    return (
      <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <AlertCircle className="mb-2" />
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-3 font-semibold underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
        <RefreshCw className="animate-spin" size={20} />
        Loading dashboard...
      </div>
    );
  }

  const themes = d.topThemes || [];
  const volume = d.volume || [];
  const sentiment = d.sentiment || { POS: 0, NEU: 0, NEG: 0 };

  const stats = [
    {
      label: 'Total Feedback',
      value: d.total ?? 0,
      icon: MessageSquare,
      color: 'bg-violet-100 text-violet-700',
      description: 'All customer responses'
    },
    {
      label: 'Negative Feedback',
      value: `${d.negativePct ?? 0}%`,
      icon: TrendingDown,
      color: 'bg-rose-100 text-rose-700',
      description: 'Needs your attention'
    },
    {
      label: 'New This Week',
      value: d.newThisWeek ?? 0,
      icon: Activity,
      color: 'bg-blue-100 text-blue-700',
      description: 'Recently received'
    },
    {
      label: 'Total Themes',
      value: themes.length,
      icon: BarChart3,
      color: 'bg-emerald-100 text-emerald-700',
      description: 'Detected feedback topics'
    }
  ];

  const sentimentItems = [
    {
      key: 'POS',
      label: 'Positive',
      value: sentiment.POS ?? 0,
      icon: ThumbsUp,
      color: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50'
    },
    {
      key: 'NEU',
      label: 'Neutral',
      value: sentiment.NEU ?? 0,
      icon: Minus,
      color: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50'
    },
    {
      key: 'NEG',
      label: 'Negative',
      value: sentiment.NEG ?? 0,
      icon: ThumbsDown,
      color: 'bg-rose-500',
      text: 'text-rose-700',
      bg: 'bg-rose-50'
    }
  ];

  return (
    <div className="min-h-screen space-y-7 bg-[#f8f9fd] p-5 sm:p-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
            Analytics Overview
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Understand what your customers are saying at a glance.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={22} />
                </div>
                <TrendingUp size={18} className="text-gray-300" />
              </div>

              <h2 className="mt-5 text-3xl font-extrabold text-gray-900">
                {item.value}
              </h2>

              <p className="mt-1 font-semibold text-gray-700">
                {item.label}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Feedback Volume */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Feedback Volume
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Customer feedback activity
              </p>
            </div>
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Activity size={20} />
            </div>
          </div>

          <div className="h-72">
            {volume.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volume}>
                  <defs>
                    <linearGradient id="feedbackGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf0f5" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fill="url(#feedbackGradient)"
                    dot={{ r: 4, fill: '#7c3aed' }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No feedback volume data available.
              </div>
            )}
          </div>
        </div>

        {/* Top Themes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Top Themes
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Most discussed customer topics
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>

          <div className="h-72">
            {themes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={themes}
                  layout="vertical"
                  margin={{ left: 10, right: 15 }}
                >
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#edf0f5" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#7c3aed"
                    radius={[0, 8, 8, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No themes available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Sentiment Breakdown
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            How customers feel about your product
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {sentimentItems.map((item) => {
            const Icon = item.icon;
            const totalSentiment = sentimentItems.reduce(
              (sum, s) => sum + s.value,
              0
            );
            const percentage = totalSentiment
              ? Math.round((item.value / totalSentiment) * 100)
              : 0;

            return (
              <div
                key={item.key}
                className={`rounded-2xl p-5 ${item.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl bg-white p-3 ${item.text}`}>
                    <Icon size={21} />
                  </div>
                  <span className={`text-sm font-bold ${item.text}`}>
                    {percentage}%
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                      {item.value}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {item.label}
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-3 text-center text-xs text-gray-400">
        LOOP · AI Customer Feedback Intelligence
      </div>

    </div>
  );
}
