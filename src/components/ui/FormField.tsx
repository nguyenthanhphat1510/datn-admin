import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  colSpan?: 1 | 2;
  children: ReactNode;
}

export default function FormField({ label, error, colSpan = 1, children }: FieldProps) {
  return (
    <div className={colSpan === 2 ? 'md:col-span-2' : undefined}>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
