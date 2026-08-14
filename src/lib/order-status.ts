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

/**
 * Từ trạng thái hiện tại, được phép chuyển sang những trạng thái nào.
 *
 * ⚠️ PHẢI KHỚP `assertValidTransition` trong
 * backend/src/orders/orders.service.ts — backend mới là nơi chặn thật, bảng này
 * chỉ để dropdown không hiện lựa chọn chắc chắn bị từ chối. Lệch nhau thì admin
 * bấm được nhưng server trả lỗi, nhìn như app hỏng.
 *
 * Luồng: pending → confirmed → shipping → delivered (tiến đúng 1 bước liền kề),
 * và pending/confirmed/shipping đều có thể → cancelled.
 * `delivered` + `cancelled` là điểm cuối — mảng rỗng, không đổi được nữa.
 */
export const ALLOWED_NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

/** Đơn đã chốt (giao xong / đã hủy) — không cho đổi trạng thái nữa. */
export function isFinalStatus(status: OrderStatus): boolean {
  return ALLOWED_NEXT_STATUS[status].length === 0;
}
