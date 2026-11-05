
'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Upload,
  Download,
  RefreshCw,
} from 'lucide-react';

type Feedback = {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  status: string;
  themes?: {
    theme?: {
      name?: string;
    };
  }[];
};

export default function Inbox() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  async function load() {
    try {
      setLoading(true);

      const params = new URLSearchParams({ q });

      if (channel) params.set('channel', channel);
      if (sentiment) params.set('sentiment', sentiment);
      if (status) params.set('status', status);

      const response = await fetch('/api/feedback?' + params);
      const data = await response.json();

      setItems(data.items || []);
    } catch {
      setImportMsg('Unable to load feedback.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: string, newStatus: string) {
    try {
      await fetch('/api/feedback/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      await load();
    } catch {
      setImportMsg('Unable to update status.');
    }
  }

  async function simulate() {
    try {
      await fetch('/api/feedback/simulate', {
        method: 'POST',
      });

      await load();
      setImportMsg('New feedback simulated successfully.');
    } catch {
      setImportMsg('Simulation failed.');
    }
  }

  function downloadCSV() {
    if (!items.length) {
      setImportMsg('No feedback available to download.');
      return;
    }

    const headers = [
      'Feedback',
      'Channel',
      'Sentiment',
      'Theme',
      'Status',
    ];

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = items.map((item) => [
      item.content,
      item.channel,
      item.sentiment,
      item.themes?.[0]?.theme?.name || '',
      item.status,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'LOOP-Feedback-Report.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setImportMsg('CSV downloaded successfully.');
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines.shift()?.split(',').map((x) =>
        x.trim().replace(/^"|"$/g, '')
      );

      if (!headers) return;

      const rows = lines.map((line) => {
        const values = line.split(',');

        return Object.fromEntries(
          headers.map((header, index) => [
            header,
            values[index]?.trim().replace(/^"|"$/g, '') || '',
          ])
        );
      });

      const response = await fetch('/api/feedback/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows }),
      });

      const data = await response.json();

      setImportMsg(
        response.ok
          ? `Imported ${data.imported}; failed ${data.failed}`
          : data.error || 'Import failed.'
      );

      await load();
    } catch {
      setImportMsg('Unable to import CSV file.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-5">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Feedback Inbox</h1>
          <p className="text-gray-500">
            Search, filter and triage customer feedback.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={downloadCSV}
            className="btn btn-soft"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>

          <label className="btn btn-soft cursor-pointer">
            <Upload size={16} className="mr-2" />
            CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={importCSV}
            />
          </label>

          <button
            onClick={simulate}
            className="btn btn-primary"
          >
            <RefreshCw size={16} className="mr-2" />
            Simulate Channel
          </button>

        </div>
      </div>

      {importMsg && (
        <div className="text-sm text-gray-600">
          {importMsg}
        </div>
      )}

      <div className="card p-4 grid md:grid-cols-4 gap-2">

        <div className="flex gap-2 md:col-span-2">
          <Search size={20} className="mt-2 text-gray-400" />

          <input
            className="input"
            placeholder="Search feedback..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>

        <select
          className="input"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="">All channels</option>
          <option>Support ticket</option>
          <option>App store review</option>
          <option>NPS survey</option>
          <option>Sales call note</option>
          <option>Community post</option>
        </select>

        <select
          className="input"
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
        >
          <option value="">All sentiment</option>
          <option value="POS">Positive</option>
          <option value="NEU">Neutral</option>
          <option value="NEG">Negative</option>
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ACTIONED">Actioned</option>
        </select>

        <button
          className="btn btn-soft md:col-span-4"
          onClick={load}
        >
          Apply filters
        </button>

      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Feedback</th>
                <th className="text-left p-4">Channel</th>
                <th className="text-left p-4">Sentiment</th>
                <th className="text-left p-4">Theme</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="border-t">

                    <td className="p-4 min-w-[340px]">
                      {item.content}
                    </td>

                    <td className="p-4">
                      {item.channel}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100">
                        {item.sentiment}
                      </span>
                    </td>

                    <td className="p-4">
                      {item.themes?.[0]?.theme?.name || '—'}
                    </td>

                    <td className="p-4">
                      <select
                        className="border rounded-lg p-2"
                        value={item.status}
                        onChange={(e) =>
                          changeStatus(item.id, e.target.value)
                        }
                      >
                        <option value="NEW">NEW</option>
                        <option value="REVIEWED">REVIEWED</option>
                        <option value="ACTIONED">ACTIONED</option>
                      </select>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-gray-500"
                  >
                    No feedback matches your filters.
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}
