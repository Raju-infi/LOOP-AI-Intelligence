
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export function Topbar() {
  const { data } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    ['/dashboard', 'Dashboard'],
    ['/inbox', 'Feedback Inbox'],
    ['/trends', 'Trends'],
    ['/ask', 'Ask LOOP'],
    ['/reports', 'VoC Reports'],
    ['/settings', 'Settings'],
  ];

  return (
    <>
      <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            <Menu size={22} />
          </button>

          <div>
            <div className="font-semibold text-gray-900">
              LOOP AI Intelligence
            </div>

            <div className="text-xs text-gray-500">
              Feedback Intelligence
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold">
            {data?.user?.name || 'User'}
          </div>

          <div className="text-xs text-brand-600">
            {(data?.user as any)?.role || ''}
          </div>
        </div>
      </header>

      {open && (
        <nav className="md:hidden bg-white border-b px-4 py-3 space-y-1">
          {links.map(([h, l]) => (
            <Link
              key={h}
              href={h}
              onClick={() => setOpen(false)}
              className="block p-2 rounded-lg hover:bg-gray-50"
            >
              {l}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
