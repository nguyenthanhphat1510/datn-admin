import type { OrderStatus } from '@/types/order';

/** Nhãn, màu badge (Tailwind) và màu biểu đồ cho từng trạng thái đơn hàng. */
export const STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string; chartColor: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    badge: 'bg-amber-50 text-amber-600',
    chartColor: '#d97706',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badge: 'bg-blue-50 text-blue-600',
    chartColor: '#2563eb',
  },
  shipping: {
    label: 'Đang giao',
    badge: 'bg-indigo-50 text-indigo-600',
    chartColor: '#4f46e5',
  },
  delivered: {
    label: 'Đã giao',
    badge: 'bg-emerald-50 text-[#007e42]',
    chartColor: '#007e42',
  },
  cancelled: {
    label: 'Đã hủy',
    badge: 'bg-red-50 text-red-600',
    chartColor: '#dc2626',
  },
};

/** Thứ tự hiển thị các trạng thái theo vòng đời đơn hàng. */
export const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipping',
  'delivered',
  'cancelled',
];
