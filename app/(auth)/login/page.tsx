
'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const r = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (r?.ok) router.push('/dashboard');
    else setError('Invalid email or password');
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      <section className="hidden lg:flex bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white p-16 items-end">
        <div>
          <div className="text-5xl font-black">LOOP</div>
          <p className="mt-4 text-xl text-white/80 max-w-lg">
            Turn scattered customer feedback into ranked, evidence-backed decisions.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md space-y-5">
          <div>
            <div className="text-3xl font-bold">Welcome back</div>
            <p className="text-gray-500 mt-1">
              Sign in to LOOP AI Intelligence
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="input mt-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="input mt-1"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>

          <p className="text-center text-sm text-gray-500">
            New here?{' '}
            <Link className="text-brand-600 font-semibold" href="/signup">
              Create account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
