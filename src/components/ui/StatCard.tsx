interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  tone?: 'default' | 'active' | 'hidden';
}

export default function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  const accent =
    tone === 'active'
      ? 'text-[#007e42]'
      : tone === 'hidden'
        ? 'text-gray-500'
        : 'text-gray-900';
  return (
    <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-extrabold ${accent}`}>{value}</div>
      <div className="text-[11px] text-gray-400">{hint}</div>
    </div>
  );
}
