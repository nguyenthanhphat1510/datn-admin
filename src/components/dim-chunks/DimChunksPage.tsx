'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listDiseaseDims,
  reEmbedMissing,
} from '@/lib/dim-chunks-api';
import {
  DISEASE_DIMS,
  DIM_LABEL,
  type DiseaseDims,
  type DiseaseDim,
} from '@/types/dim-chunk';
import { ISearch, IAlert, IRotate, ILeaf } from '@/components/icons';
import StatCard from '@/components/ui/StatCard';
import Th from '@/components/ui/TableHead';
import DimChunkEditor from './DimChunkEditor';

/** Lấy message lỗi từ response axios, có fallback. */
function errMessage(err: unknown, fallback: string): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg ?? fallback;
}

export default function DimChunksPage() {
  const [data, setData] = useState<DiseaseDims[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reEmbedding, setReEmbedding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Ô đang mở để sửa: null = không mở ô nào. Mỗi lúc chỉ mở MỘT ô cho đỡ rối.
  const [editing, setEditing] = useState<{
    slug: string;
    chieu: DiseaseDim;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listDiseaseDims());
    } catch (err) {
      console.error(err);
      setError('Không tải được dữ liệu dấu hiệu. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (d) =>
        d.diseaseName.toLowerCase().includes(q) ||
        d.diseaseSlug.toLowerCase().includes(q) ||
        d.dims.some((x) => (x.chunk?.content ?? '').toLowerCase().includes(q)),
    );
  }, [data, search]);

  // Số bệnh đã đủ 4 chiều dùng được — đây là con số admin cần nhìn nhất, vì bệnh
  // thiếu chiều sẽ bị chấm điểm thiếu, dễ thua bệnh khác một cách oan uổng.
  const dayDu = data.filter((d) => d.missingDims.length === 0).length;
  const soChieuThieu = data.reduce((sum, d) => sum + d.missingDims.length, 0);
  // Chiều đã có nội dung nhưng vector hỏng/thiếu → sinh lại được bằng 1 nút.
  const soChieuHongVector = data.reduce(
    (sum, d) =>
      sum + d.dims.filter((x) => x.chunk && !x.chunk.hasEmbedding).length,
    0,
  );

  const handleReEmbedMissing = async () => {
    setReEmbedding(true);
    setNotice(null);
    try {
      const res = await reEmbedMissing();
      setNotice(
        res.total === 0
          ? 'Không có dấu hiệu nào thiếu vector.'
          : `Đã sinh lại ${res.done}/${res.total} vector` +
              (res.failed > 0
                ? ` — còn ${res.failed} dấu hiệu lỗi (thường do hết quota Gemini trong ngày, mai chạy lại).`
                : '.'),
      );
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(errMessage(err, 'Sinh lại vector thất bại'));
    } finally {
      setReEmbedding(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#007e42]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Dữ liệu chẩn đoán
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Mô tả{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)',
              }}
            >
              dấu hiệu bệnh
            </span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Mỗi bệnh được tả theo 5 dấu hiệu cố định. Chatbot so mô tả của người
            dùng với từng dấu hiệu để chấm điểm, nên ở cùng một dấu hiệu thì các
            bệnh phải viết khác nhau rõ rệt.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReEmbedMissing}
          disabled={reEmbedding || soChieuHongVector === 0}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#007e42] hover:text-[#007e42] disabled:cursor-not-allowed disabled:opacity-50"
          title={
            soChieuHongVector === 0
              ? 'Mọi dấu hiệu đã có vector'
              : `${soChieuHongVector} dấu hiệu có nội dung nhưng thiếu vector`
          }
        >
          <IRotate />
          {reEmbedding ? 'Đang sinh vector...' : `Sinh lại vector thiếu (${soChieuHongVector})`}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Bệnh đủ 5 dấu hiệu"
          value={dayDu}
          hint={`/ ${data.length} bệnh`}
          tone="active"
        />
        <StatCard
          label="Dấu hiệu cần xử lý"
          value={soChieuThieu}
          hint={
            soChieuHongVector > 0
              ? `Chưa có, đang tắt, hoặc thiếu vector (${soChieuHongVector} thiếu vector)`
              : 'Chưa có, đang tắt, hoặc thiếu vector'
          }
          tone={soChieuThieu > 0 ? 'hidden' : 'active'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
        <div className="relative min-w-[200px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ISearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh, slug, hoặc nội dung mô tả..."
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

      {notice && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-semibold text-emerald-700 underline"
          >
            Đóng
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-gray-300 bg-white px-4 py-12 text-center text-sm text-gray-400">
          Đang tải...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-12">
          <ILeaf size={40} />
          <p className="text-sm font-semibold text-gray-600">
            {data.length === 0 ? 'Chưa có bệnh nào' : 'Không tìm thấy bệnh phù hợp'}
          </p>
          <p className="text-xs text-gray-400">
            {data.length === 0
              ? 'Tạo bệnh ở trang "Bệnh lúa" trước, rồi quay lại đây khai báo 5 dấu hiệu'
              : 'Thử từ khóa khác'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {!loading &&
          filtered.map((d) => (
            <section
              key={d.diseaseSlug}
              className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-800">{d.diseaseName}</h2>
                  <code className="rounded bg-gray-200 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                    {d.diseaseSlug}
                  </code>
                </div>
                {d.missingDims.length === 0 ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Đủ 5 dấu hiệu
                  </span>
                ) : (
                  <span
                    title={`Cần xử lý: ${d.missingDims
                      .map((x) => DIM_LABEL[x])
                      .join(', ')}`}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                  >
                    <IAlert />
                    Thiếu {d.missingDims.length}/5 dấu hiệu
                  </span>
                )}
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-[#007e42] [&_th]:text-white">
                    <tr>
                      <Th>Dấu hiệu</Th>
                      <Th>Mô tả</Th>
                      <Th>Trạng thái</Th>
                      <Th align="right">Hành động</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {DISEASE_DIMS.map((chieu) => {
                      const found = d.dims.find((x) => x.chieu === chieu);
                      return (
                        <DimChunkEditor
                          key={chieu}
                          diseaseSlug={d.diseaseSlug}
                          chieu={chieu}
                          chunk={found?.chunk ?? null}
                          isOpen={
                            editing?.slug === d.diseaseSlug && editing?.chieu === chieu
                          }
                          onOpen={() => setEditing({ slug: d.diseaseSlug, chieu })}
                          onClose={() => setEditing(null)}
                          onSaved={() => {
                            setEditing(null);
                            fetchData();
                          }}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
