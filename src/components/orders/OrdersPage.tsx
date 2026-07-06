'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { listOrders, updateOrderStatus } from '@/lib/orders-api';
import type { Order, OrderStatus } from '@/types/order';
import { ILeaf, IAlert } from '@/components/icons';
import StatCard from '@/components/ui/StatCard';
import SelectMenu from '@/components/ui/SelectMenu';
import Pagination from '@/components/ui/Pagination';
import Th from '@/components/ui/TableHead';
import { STATUS_META, STATUS_ORDER } from '@/lib/order-status';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label })),
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMIT = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listOrders({
        status: (statusFilter || undefined) as OrderStatus | undefined,
        page,
        limit: LIMIT,
      });
      setOrders(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách đơn hàng. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Đổi bộ lọc trạng thái → quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    setUpdatingId(order._id);
    try {
      await updateOrderStatus(order._id, status);
      // Cập nhật tại chỗ để không phải reload toàn bộ
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status } : o)),
      );
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  // Thống kê. "Tổng đơn" lấy total thật từ server; 2 thẻ còn lại tính trên
  // trang hiện tại (phân trang server-side nên không có sẵn số toàn cục).
  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) => o.status === 'pending').length;
    return { pending, revenue };
  }, [orders]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#007e42]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý đơn hàng
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              đơn hàng
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và cập nhật trạng thái đơn hàng của khách
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng đơn" value={total} hint="Toàn hệ thống" />
        <StatCard label="Chờ xác nhận" value={stats.pending} hint="Trang này" tone="active" />
        <StatCard
          label="Doanh thu (đã giao)"
          value={stats.revenue}
          hint="Trang này"
          format="currency"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-medium text-gray-500">Lọc theo trạng thái:</span>
        <SelectMenu
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Tất cả trạng thái"
          className="min-w-[200px]"
          options={STATUS_OPTIONS}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IAlert />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-[#007e42] [&_th]:text-white">
              <tr>
                <Th>Mã đơn</Th>
                <Th>Khách hàng</Th>
                <Th>Ngày đặt</Th>
                <Th align="right">Tổng tiền</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Cập nhật</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ILeaf size={40} />
                      <p className="text-sm font-semibold text-gray-600">Chưa có đơn hàng nào</p>
                      <p className="text-xs text-gray-400">
                        Đơn hàng của khách sẽ hiển thị ở đây
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((o, i) => {
                  const meta = STATUS_META[o.status];
                  const isExpanded = expanded === o._id;
                  return (
                    <Fragment key={o._id}>
                      <tr
                        className="animate-fade-in-up cursor-pointer transition hover:bg-emerald-100/70"
                        style={{ animationDelay: `${i * 30}ms` }}
                        onClick={() => setExpanded(isExpanded ? null : o._id)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-gray-700">
                            #{o._id.slice(-8).toUpperCase()}
                          </span>
                          <div className="text-[11px] text-gray-400">
                            {o.items.length} sản phẩm
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-800">
                            {o.shippingAddress.fullName}
                          </div>
                          <div className="text-xs text-gray-500">{o.shippingAddress.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {fmtDate(o.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-[#007e42]">
                          {fmt(o.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${meta.badge}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <SelectMenu
                              value={o.status}
                              onChange={(v) => handleStatusChange(o, v as OrderStatus)}
                              className="w-44"
                              options={STATUS_ORDER.map((s) => ({
                                value: s,
                                label: STATUS_META[s].label,
                              }))}
                            />
                          </div>
                          {updatingId === o._id && (
                            <div className="mt-1 text-right text-[10px] text-gray-400">
                              Đang lưu...
                            </div>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50/60">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Sản phẩm */}
                              <div>
                                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                  Sản phẩm
                                </div>
                                <ul className="space-y-2">
                                  {o.items.map((it) => (
                                    <li
                                      key={it.productId}
                                      className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-2"
                                    >
                                      {it.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={it.imageUrl}
                                          alt={it.name}
                                          className="h-12 w-12 rounded-md border border-gray-300 object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50">
                                          <ILeaf size={24} />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold text-gray-800">
                                          {it.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {fmt(it.price)} × {it.quantity}
                                        </div>
                                      </div>
                                      <div className="text-sm font-bold tabular-nums text-gray-700">
                                        {fmt(it.subtotal)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Giao hàng + tổng tiền */}
                              <div className="space-y-3">
                                <div>
                                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Địa chỉ giao hàng
                                  </div>
                                  <div className="rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700">
                                    <div className="font-semibold">
                                      {o.shippingAddress.fullName} · {o.shippingAddress.phone}
                                    </div>
                                    <div className="text-gray-600">
                                      {o.shippingAddress.address}
                                    </div>
                                    {o.note && (
                                      <div className="mt-2 text-xs italic text-gray-500">
                                        Ghi chú: {o.note}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="rounded-lg border border-gray-300 bg-white p-3 text-sm">
                                  <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="tabular-nums">
                                      {fmt(o.total - o.shippingFee)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>Phí giao hàng</span>
                                    <span className="tabular-nums">{fmt(o.shippingFee)}</span>
                                  </div>
                                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-bold text-[#007e42]">
                                    <span>Tổng cộng</span>
                                    <span className="tabular-nums">{fmt(o.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && (
        <Pagination
          page={page}
          total={total}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
