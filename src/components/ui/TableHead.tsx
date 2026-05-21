import type { ReactNode } from 'react';

interface ThProps {
  children: ReactNode;
  align?: 'left' | 'right';
}

export default function Th({ children, align = 'left' }: ThProps) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}
