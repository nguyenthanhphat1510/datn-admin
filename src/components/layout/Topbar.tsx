'use client';

import { useAuth } from '@/contexts/AuthContext';

function ILogOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
            Đang chạy chế độ demo
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          title="Chưa có thông báo"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full border border-gray-100 text-gray-300"
        >
          <IBell />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-bold uppercase text-white"
            style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
          >
            {user?.name?.[0] ?? 'A'}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-800">{user?.name ?? 'Khách'}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              {user?.role ?? 'guest'}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled
          title="Chưa bật đăng nhập"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-gray-200 text-gray-400"
        >
          <ILogOut />
        </button>
      </div>
    </header>
  );
}
