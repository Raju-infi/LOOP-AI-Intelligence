
'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        workspaceName: 'LOOP AI Intelligence',
      }),
    });

    const d = await r.json();

    if (!r.ok) {
      setError(d.error || 'Unable to create account');
      return;
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={submit} className="card p-8 w-full max-w-md space-y-4">
        <div>
          <div className="text-3xl font-bold">Create your workspace</div>
          <p className="text-gray-500 mt-1">
            Your account starts as Admin.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <input
          className="input"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Password (8+ characters)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-full">
          Create account
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link className="text-brand-600 font-semibold" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
