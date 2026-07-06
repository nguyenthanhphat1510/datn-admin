'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  listTechniques,
  uploadTechnique,
  deleteTechnique,
} from '@/lib/techniques-api';
import type { TechniqueDoc } from '@/types/technique';
import { ITrash, IAlert, ILeaf, IPlus } from '@/components/icons';
import StatCard from '@/components/ui/StatCard';
import IconBtn from '@/components/ui/IconBtn';
import Th from '@/components/ui/TableHead';
import Pagination from '@/components/ui/Pagination';

// Đuôi file cho phép upload. Backend đọc PDF qua pdf-parse, còn lại đọc text thuần.
const ACCEPT = '.pdf,.txt,.md,application/pdf,text/plain';
const ALLOWED_EXT = ['.pdf', '.txt', '.md'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function TechniquesPage() {
  const [docs, setDocs] = useState<TechniqueDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const LIMIT = 5;

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listTechniques();
      setDocs(list);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách tài liệu. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Phân trang client-side
  const paged = useMemo(
    () => docs.slice((page - 1) * LIMIT, page * LIMIT),
    [docs, page],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input ngay để chọn lại cùng 1 file vẫn trigger onChange.
    e.target.value = '';
    if (!file) return;

    setUploadMsg(null);
    setUploadErr(null);

    // Validate phía client trước khi gọi API.
    const name = file.name.toLowerCase();
    if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
      setUploadErr('Chỉ chấp nhận file PDF, .txt hoặc .md');
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploadErr('File quá lớn (tối đa 20MB)');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadTechnique(file);
      setUploadMsg(`Đã nạp "${res.docTitle}" thành ${res.chunks} đoạn.`);
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      setUploadErr(msg ?? 'Tải tài liệu lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: TechniqueDoc) => {
    if (!confirm(`Xóa tài liệu "${doc.docTitle}"?\nToàn bộ ${doc.chunks} đoạn sẽ bị xóa.`)) {
      return;
    }
    try {
      await deleteTechnique(doc.docId);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      alert(msg ?? 'Xóa tài liệu thất bại');
    }
  };

  const totalChunks = docs.reduce((sum, d) => sum + d.chunks, 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Tài liệu kỹ thuật
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Tài liệu{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              canh tác lúa
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tải lên tài liệu (PDF, .txt, .md). Hệ thống tự tách đoạn và lập chỉ mục để chatbot
            trả lời câu hỏi kỹ thuật canh tác.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
          >
            <IPlus />
            {uploading ? 'Đang xử lý...' : 'Tải tài liệu lên'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard label="Số tài liệu" value={docs.length} hint="Đã nạp vào hệ thống" />
        <StatCard
          label="Tổng số đoạn"
          value={totalChunks}
          hint="Chunk đã lập chỉ mục"
          tone="active"
        />
      </div>

      {uploadMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-[#007e42]">
          {uploadMsg}
        </div>
      )}
      {uploadErr && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IAlert />
          {uploadErr}
        </div>
      )}
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
                <Th>Tên tài liệu</Th>
                <Th>Số đoạn</Th>
                <Th>Ngày tải lên</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && docs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ILeaf size={40} />
                      <p className="text-sm font-semibold text-gray-600">
                        Chưa có tài liệu nào
                      </p>
                      <p className="text-xs text-gray-400">
                        Bấm &quot;Tải tài liệu lên&quot; để thêm tài liệu đầu tiên
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                paged.map((doc, i) => (
                  <tr
                    key={doc.docId}
                    className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-800">
                        {doc.docTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#007e42]">
                        {doc.chunks} đoạn
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(doc.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn
                          title="Xóa tài liệu"
                          tone="danger"
                          onClick={() => handleDelete(doc)}
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

      {!loading && !error && (
        <Pagination
          page={page}
          total={docs.length}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
