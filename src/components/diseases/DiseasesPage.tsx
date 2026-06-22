'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  hardDeleteDisease,
  listDiseases,
  restoreDisease,
  softDeleteDisease,
} from '@/lib/diseases-api';
import type { Disease } from '@/types/disease';
import {
  IPlus,
  IPencil,
  ITrash,
  IEye,
  IEyeOff,
  ISearch,
  ILeaf,
  IRotate,
  IAlert,
} from '@/components/icons';
import StatCard from '@/components/ui/StatCard';
import IconBtn from '@/components/ui/IconBtn';
import Th from '@/components/ui/TableHead';
import DiseaseFormModal from './DiseaseFormModal';

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Disease | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listDiseases(true); // include inactive
      setDiseases(list);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách bệnh. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter search client-side (danh sách thường nhỏ)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return diseases;
    return diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q) ||
        d.symptoms.some((s) => s.toLowerCase().includes(q)),
    );
  }, [diseases, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (d: Disease) => {
    setEditing(d);
    setModalOpen(true);
  };

  const handleSoftDelete = async (d: Disease) => {
    if (!confirm(`Ẩn bệnh "${d.name}"?`)) return;
    try {
      await softDeleteDisease(d._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Ẩn bệnh thất bại');
    }
  };

  const handleRestore = async (d: Disease) => {
    try {
      await restoreDisease(d._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Khôi phục bệnh thất bại');
    }
  };

  const handleHardDelete = async (d: Disease) => {
    if (
      !confirm(`XÓA VĨNH VIỄN bệnh "${d.name}"?\nKhông thể khôi phục.`)
    ) {
      return;
    }
    try {
      await hardDeleteDisease(d._id);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Xóa bệnh thất bại');
    }
  };

  const totalActive = diseases.filter((d) => d.isActive).length;
  const totalHidden = diseases.length - totalActive;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý bệnh
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              bệnh lúa
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm, sửa, xóa bệnh. Triệu chứng dùng để chatbot chẩn đoán, thuốc gợi ý liên kết tới sản phẩm.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <IPlus />
          Thêm bệnh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng số bệnh" value={diseases.length} hint="Tất cả trong DB" />
        <StatCard label="Đang hiện" value={totalActive} hint="Đang dùng" tone="active" />
        <StatCard label="Đang ẩn" value={totalHidden} hint="Soft delete" tone="hidden" />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ISearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bệnh theo tên, slug, triệu chứng..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IAlert />
          {error}
        </div>
      )}

      {!loading && !error && (
        <p className="text-sm text-gray-500">
          Hiển thị <span className="font-semibold text-gray-800">{filtered.length}</span> /{' '}
          <span className="font-semibold text-gray-800">{diseases.length}</span> bệnh
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-[#007e42] [&_th]:text-white">
              <tr>
                <Th>Tên bệnh</Th>
                <Th>Slug</Th>
                <Th>Triệu chứng</Th>
                <Th>Thuốc gợi ý</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Hành động</Th>
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
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ILeaf size={40} />
                      <p className="text-sm font-semibold text-gray-600">
                        {diseases.length === 0
                          ? 'Chưa có bệnh nào'
                          : 'Không tìm thấy bệnh phù hợp'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {diseases.length === 0
                          ? 'Bấm "Thêm bệnh" để tạo bệnh đầu tiên'
                          : 'Thử từ khóa khác'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((d, i) => (
                  <tr
                    key={d._id}
                    className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100">
                          <ILeaf size={20} />
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{d.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                        {d.slug}
                      </code>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      {d.symptoms.length === 0 ? (
                        <span className="italic text-gray-300">— trống —</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {d.symptoms.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                            >
                              {s}
                            </span>
                          ))}
                          {d.symptoms.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                              +{d.symptoms.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#007e42]">
                        {d.recommendedProductIds.length} thuốc
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {d.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#007e42]">
                          <IEye />
                          Hiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          <IEyeOff />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Sửa" onClick={() => openEdit(d)}>
                          <IPencil />
                        </IconBtn>
                        {d.isActive ? (
                          <IconBtn title="Ẩn" onClick={() => handleSoftDelete(d)}>
                            <IEyeOff />
                          </IconBtn>
                        ) : (
                          <IconBtn
                            title="Hiện lại"
                            tone="success"
                            onClick={() => handleRestore(d)}
                          >
                            <IRotate />
                          </IconBtn>
                        )}
                        <IconBtn
                          title="Xóa vĩnh viễn"
                          tone="danger"
                          onClick={() => handleHardDelete(d)}
                        >
                          <ITrash />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <DiseaseFormModal
          disease={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
