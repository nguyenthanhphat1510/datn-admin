'use client';

import { useRouter } from 'next/navigation';
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

function IMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-300 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-2">
        {/* Nút mở menu chỉ hiện trên mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
          aria-label="Mở menu"
        >
          <IMenu />
        </button>
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
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-gray-800">{user?.name ?? 'Khách'}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              {user?.role ?? 'guest'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <ILogOut />
        </button>
      </div>
    </header>
  );
}
