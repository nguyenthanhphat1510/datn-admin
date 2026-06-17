'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getDashboardStats } from '@/lib/dashboard-api';
import type { DashboardStats } from '@/types/dashboard';
import { STATUS_META, STATUS_ORDER } from '@/lib/order-status';
import StatCard from '@/components/ui/StatCard';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

/** Rút gọn số tiền cho trục/tooltip biểu đồ (vd 1.500.000 → 1.5tr). */
function fmtShort(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toLocaleString('vi-VN') + 'tr';
  if (n >= 1_000) return (n / 1_000).toLocaleString('vi-VN') + 'k';
  return String(n);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getDashboardStats()
      .then((data) => {
        if (alive) setStats(data);
      })
      .catch(() => {
        if (alive) setError('Không tải được số liệu thống kê.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Dữ liệu cho pie chart trạng thái đơn — bỏ status có count = 0
  const statusData = useMemo(() => {
    if (!stats) return [];
    return STATUS_ORDER.filter((s) => stats.ordersByStatus[s] > 0).map((s) => ({
      status: s,
      label: STATUS_META[s].label,
      value: stats.ordersByStatus[s],
      color: STATUS_META[s].chartColor,
    }));
  }, [stats]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Đang tải số liệu…</div>;
  }

  if (error || !stats) {
    return <div className="p-6 text-sm text-red-600">{error ?? 'Lỗi'}</div>;
  }

  const { kpi, monthlyRevenue } = stats;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-400">Số liệu toàn hệ thống</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Doanh thu
          </div>
          <div className="mt-1 text-2xl font-extrabold text-[#007e42]">
            {fmt(kpi.totalRevenue)}
          </div>
          <div className="text-[11px] text-gray-400">Đơn đã giao</div>
        </div>
        <StatCard label="Tổng đơn" value={kpi.totalOrders} hint="Mọi trạng thái" />
        <StatCard label="Người dùng" value={kpi.totalUsers} hint="Khách hàng" />
        <StatCard label="Sản phẩm" value={kpi.totalProducts} hint="Trong kho" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Biểu đồ doanh thu theo tháng */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-gray-700">
            Doanh thu 12 tháng gần nhất
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" fontSize={12} stroke="#9ca3af" />
              <YAxis
                tickFormatter={fmtShort}
                fontSize={12}
                stroke="#9ca3af"
                width={48}
              />
              <Tooltip
                formatter={(v) => [fmt(Number(v)), 'Doanh thu']}
                labelFormatter={(l) => `Tháng ${String(l).replace('T', '')}`}
              />
              <Bar dataKey="revenue" fill="#007e42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Đơn theo trạng thái */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-gray-700">
            Đơn theo trạng thái
          </h2>
          {statusData.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Chưa có đơn hàng
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {statusData.map((d) => (
                      <Cell key={d.status} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v)} đơn`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-3 space-y-1.5">
                {statusData.map((d) => (
                  <li
                    key={d.status}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-gray-600">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.label}
                    </span>
                    <span className="font-semibold text-gray-900">{d.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
