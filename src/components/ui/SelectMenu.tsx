'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

function IChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ICheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Dropdown tùy chỉnh thay cho native <select> — kiểm soát hoàn toàn màu sắc
 * (xanh lá thương hiệu). Danh sách option render qua Portal ra <body> để
 * không bị overflow của bảng cắt và không bị các hàng khác đè lên.
 */
export default function SelectMenu({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className = '',
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  // Portal chỉ chạy client-side
  useEffect(() => setMounted(true), []);

  // Tính vị trí nút mỗi khi mở
  const updateRect = () => {
    if (rootRef.current) setRect(rootRef.current.getBoundingClientRect());
  };

  useLayoutEffect(() => {
    if (open) updateRect();
  }, [open]);

  // Đóng khi click ngoài / Escape; cập nhật vị trí khi scroll/resize
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        rootRef.current?.contains(t) ||
        menuRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScrollResize = () => updateRect();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm font-medium text-gray-700 outline-none transition ${
          open
            ? 'border-[#007e42] ring-1 ring-[#007e42]'
            : 'border-gray-300 hover:border-[#007e42]/50'
        }`}
      >
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="text-gray-400">
          <IChevron open={open} />
        </span>
      </button>

      {mounted &&
        open &&
        rect &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: rect.bottom + 6,
              left: rect.left,
              width: rect.width,
            }}
            className="z-9999 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl animate-fade-in-up"
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                      active
                        ? 'bg-emerald-50 font-semibold text-[#007e42]'
                        : 'text-gray-700 hover:bg-emerald-50/60 hover:text-[#007e42]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {active && (
                      <span className="shrink-0 text-[#007e42]">
                        <ICheck />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
