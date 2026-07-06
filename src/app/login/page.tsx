'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.2 4.1" />
      <path d="M6.1 6.1C3.5 7.7 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.4 5-1.2" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Đã đăng nhập rồi thì khỏi ở lại trang login.
  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      const axiosMsg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      const msg =
        err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(axiosMsg ?? msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5e7eb] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
        <div className="px-7 py-7">
          {/* Logo + tiêu đề */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#007e42]/10 ring-1 ring-[#007e42]/20">
              <Image src="/caylua.jpg" alt="DATN Admin" width={56} height={56} className="object-cover" />
            </div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#007e42]/20 bg-emerald-50 px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#007e42]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
                Trang quản trị
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#007e42]">
              Chào mừng trở lại
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Đăng nhập bằng tài khoản quản trị viên để tiếp tục.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Field
              label="Email"
              icon={<IconMail />}
              type="email"
              placeholder="admin@datn.local"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />

            <Field
              label="Mật khẩu"
              icon={<IconLock />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              trailing={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 transition hover:text-[#007e42]"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <IconEye open={showPassword} />
                </button>
              }
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#007e42] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#006836] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  trailing,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-700">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 transition focus-within:border-[#007e42] focus-within:ring-2 focus-within:ring-[#007e42]/20">
        <span className="text-gray-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        {trailing}
      </span>
    </label>
  );
}
