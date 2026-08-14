'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: () => ReactElement;
  disabled?: boolean;
}

function IDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function IPackage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ICart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ILeaf({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function IFactory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}

// Icon cho trang "Bệnh lúa": phiến lá lúa mang vết bệnh HÌNH THOI hai đầu nhọn —
// đúng hình dạng vết đạo ôn lá ngoài đồng. Vết vẽ lệch sang một bên gân, không
// nằm chồng lên gân, nếu không ở cỡ 18px hai nét dính vào nhau là mất hình.
function IVirus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* phiến lá: gốc dưới-trái, ngọn nhọn vươn lên trên-phải */}
      <path d="M6.5 21.5C3.5 14 6 6.5 20.5 2.5 18.5 17 12.5 21 6.5 21.5Z" />
      {/* gân chính, chỉ vẽ đoạn gốc cho thoáng */}
      <path d="M7.5 20.5 12 14.8" />
      {/* vết bệnh hình thoi */}
      <path d="M17.2 6.2c.6 2.8-.6 5.6-3 7 -.6-2.8.6-5.6 3-7Z" />
    </svg>
  );
}

// Icon cho trang "Dấu hiệu bệnh": kính lúp soi vào lá có vết — trang này là nơi
// TẢ KỸ từng dấu hiệu của vết, nên nhấn vào việc soi/quan sát. Lúp đặt cạnh ngọn
// lá chứ không trùm lên lá, để cỡ nhỏ vẫn đọc ra "lá + kính lúp".
function IDims() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* phiến lá thu nhỏ, nhường chỗ cho kính lúp */}
      <path d="M3 21.5C.8 15.5 2.8 9.5 13 6.5 11.5 17 7.5 20.8 3 21.5Z" />
      <path d="M3.8 20.8 7.5 16.2" />
      {/* kính lúp + vết bệnh hình thoi đang được soi */}
      <circle cx="16.5" cy="8.5" r="5" />
      <path d="M20.2 12.2 22.8 14.8" />
      <path d="M18.2 6.6c.4 2-.5 3.9-2.2 4.8-.4-2 .5-3.9 2.2-4.8Z" />
    </svg>
  );
}

function IDocument() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tổng quan', href: '/dashboard', icon: IDashboard },
  { label: 'Sản phẩm', href: '/products', icon: IPackage },
  { label: 'Danh mục', href: '/categories', icon: IGrid },
  { label: 'Danh mục con', href: '/subcategories', icon: () => <ILeaf size={18} /> },
  { label: 'Nhà sản xuất', href: '/manufacturers', icon: IFactory },
  { label: 'Bệnh lúa', href: '/diseases', icon: IVirus },
  // Đặt ngay dưới "Bệnh lúa": tả dấu hiệu luôn là việc làm TIẾP SAU khi tạo bệnh.
  { label: 'Dấu hiệu bệnh', href: '/disease-dims', icon: IDims },
  { label: 'Tài liệu kỹ thuật', href: '/techniques', icon: IDocument },
  { label: 'Người dùng', href: '/users', icon: IUsers },
  { label: 'Đơn hàng', href: '/orders', icon: ICart },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function IClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mờ khi mở drawer trên mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[#005f32] bg-[#007e42] text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4 text-white">
          <Image
            src="/caylua.jpg"
            alt="Cây lúa"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="text-sm font-extrabold uppercase tracking-wide">TP Agri Admin</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-emerald-100/90">
              Vật tư nông nghiệp
            </div>
          </div>
          {/* Nút đóng chỉ hiện trên mobile */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Đóng menu"
          >
            <IClose />
          </button>
        </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            if (item.disabled) {
              return (
                <li key={item.href}>
                  <div
                    className="flex cursor-not-allowed items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm text-emerald-100/40"
                    title="Đang phát triển"
                  >
                    <span className="flex items-center gap-3">
                      <Icon />
                      {item.label}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-100/60">
                      Soon
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition hover:bg-white/10 ${
                    active
                      ? 'border-transparent bg-white font-semibold text-[#007e42] shadow-sm'
                      : 'border-transparent text-emerald-50/90 hover:text-white'
                  }`}
                >
                  <Icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

        <div className="border-t border-white/10 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-emerald-100/60">
      
        </div>
      </aside>
    </>
  );
}
