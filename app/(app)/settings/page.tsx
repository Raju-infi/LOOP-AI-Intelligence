
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Users, Shield, UserPlus } from 'lucide-react';

export default function Settings() {
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'ANALYST',
    password: 'Temp@12345',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/members');
    setMembers(r.ok ? await r.json() : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();

    const r = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const d = await r.json();

    setMessage(r.ok ? 'Member added' : d.error || 'Failed');

    if (r.ok) {
      setForm({
        name: '',
        email: '',
        role: 'ANALYST',
        password: 'Temp@12345',
      });
      load();
    }
  }

  async function role(id: string, role: string) {
    await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    });

    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-gray-500">LOOP AI Intelligence</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <UserPlus className="text-brand-600" />
          <h2 className="font-bold">Add teammate</h2>
        </div>

        <form onSubmit={create} className="grid md:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <select
            className="input"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option>ADMIN</option>
            <option>ANALYST</option>
            <option>VIEWER</option>
          </select>

          <button className="btn btn-primary">Add member</button>
        </form>

        {message && (
          <p className="text-sm text-gray-500 mt-3">
            {message}. Give the teammate the temporary password securely.
          </p>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <Users className="text-brand-600" />
          <h2 className="font-bold">Members & roles</h2>
        </div>

        <div className="space-y-3">
          {members.map(m => (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 rounded-xl bg-gray-50"
            >
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-gray-500">{m.email}</div>
              </div>

              <select
                className="border rounded-lg p-2 text-sm bg-white"
                value={m.role}
                onChange={e => role(m.id, e.target.value)}
              >
                <option>ADMIN</option>
                <option>ANALYST</option>
                <option>VIEWER</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex gap-3">
          <Shield className="text-brand-600" />
          <div>
            <h2 className="font-bold">Security</h2>
            <p className="text-sm text-gray-500 mt-1">
              All tenant-owned data is scoped by workspaceId at the API layer.
              API keys remain server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
