'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Toast thông báo nổi góc màn hình cho trang admin.
 *
 * Thay cho `alert()`: alert chặn cả trang cho tới khi bấm OK, và trên Chrome còn
 * kèm dòng "trang này cho biết..." nhìn như lỗi trình duyệt chứ không phải thông
 * báo của app.
 *
 * Tự viết thay vì cài lib: admin chỉ có next/react/axios/recharts..., thêm một
 * package chỉ để hiện mấy dòng chữ là không đáng. Bản này giữ cùng cách dùng với
 * ToastContext bên frontend để hai app hành xử giống nhau.
 */

type ToastKind = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

interface ToastContextValue {
  /** Hiện một toast. Tự biến mất sau `duration` ms. */
  showToast: (message: string, kind?: ToastKind, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Toast lỗi để lâu hơn: cần đọc kịp lý do rồi mới quyết định làm gì. */
const DURATION: Record<ToastKind, number> = {
  success: 4000,
  info: 5000,
  error: 7000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Giữ id timer để dọn khi unmount — tránh setState trên component đã gỡ.
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'info', duration?: number) => {
      // Date.now() có thể trùng khi bắn 2 toast trong cùng 1ms → cộng thêm số
      // ngẫu nhiên để key React không đụng nhau.
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, kind, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration ?? DURATION[kind]),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(clearTimeout);
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast phải nằm trong <ToastProvider>');
  }
  return ctx;
}

/* ─────────────────────────────────────────
   Khung hiển thị — cố định góc trên bên phải
───────────────────────────────────────── */
function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    // pointer-events-none ở khung + auto ở từng thẻ: vùng trống quanh toast
    // không chặn click vào trang bên dưới.
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
      role="region"
      aria-label="Thông báo"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

const STYLE: Record<ToastKind, { bar: string; text: string }> = {
  success: { bar: 'bg-[#007e42]', text: '✓' },
  error: { bar: 'bg-red-500', text: '!' },
  info: { bar: 'bg-blue-500', text: 'i' },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const s = STYLE[toast.kind];

  return (
    <div
      // role=alert để trình đọc màn hình đọc ngay.
      role="alert"
      className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${s.bar}`}
      >
        {s.text}
      </span>

      <p className="min-w-0 flex-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {toast.message}
      </p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Đóng thông báo"
        className="-mr-1 -mt-1 shrink-0 rounded p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
