'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Guard client-side: chưa đăng nhập hoặc không phải admin → đá về /login.
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Đang khôi phục phiên, hoặc chưa xác thực xong → hiện màn chờ, KHÔNG render panel.
  if (isLoading || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e7eb]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#007e42]" />
          <span className="text-sm font-medium">Đang tải…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[#e5e7eb]">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
