import type { ReactNode } from 'react';

interface IconBtnProps {
  children: ReactNode;
  onClick: () => void;
  title: string;
  tone?: 'default' | 'danger' | 'success';
}

export default function IconBtn({ children, onClick, title, tone = 'default' }: IconBtnProps) {
  const toneClass =
    tone === 'danger'
      ? 'border-transparent text-red-500 hover:border-red-200 hover:bg-red-50'
      : tone === 'success'
        ? 'border-transparent text-[#007e42] hover:border-[#007e42]/20 hover:bg-emerald-50'
        : 'border-transparent text-gray-500 hover:border-[#007e42]/20 hover:bg-emerald-50 hover:text-[#007e42]';
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${toneClass}`}
    >
      {children}
    </button>
  );
}
