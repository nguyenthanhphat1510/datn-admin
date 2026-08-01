'use client';

import { useState } from 'react';
import {
  upsertDimChunk,
  reEmbedDimChunk,
  setDimChunkActive,
  deleteDimChunk,
} from '@/lib/dim-chunks-api';
import {
  DIM_LABEL,
  DIM_HINT,
  type DimChunk,
  type DiseaseDim,
} from '@/types/dim-chunk';
import { IPencil, ITrash, IRotate, IEye, IEyeOff, IAlert } from '@/components/icons';

/** Lấy message lỗi từ response axios, có fallback. */
function errMessage(err: unknown, fallback: string): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg ?? fallback;
}

interface Props {
  diseaseSlug: string;
  chieu: DiseaseDim;
  chunk: DimChunk | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Một dòng = một CHIỀU của một bệnh. Đóng thì chỉ hiện nội dung + trạng thái;
 * mở thì thành ô nhập.
 *
 * Lưu là backend sinh lại vector NGAY, và nếu embed lỗi thì KHÔNG lưu gì cả —
 * nên lỗi phải hiện rõ tại chỗ, đừng để admin tưởng đã lưu xong.
 */
export default function DimChunkEditor({
  diseaseSlug,
  chieu,
  chunk,
  isOpen,
  onOpen,
  onClose,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nội dung đang gõ. `null` = chưa sửa gì → hiển thị thẳng giá trị từ server, nên
  // dữ liệu server đổi (vd sau "Sinh lại vector thiếu") là tự khớp lại, không cần
  // useEffect đồng bộ. Khi admin gõ thì giữ bản nháp, không bị server đè lên.
  const [draft, setDraft] = useState<string | null>(null);
  const content = draft ?? chunk?.content ?? '';
  const setContent = (v: string) => setDraft(v);

  const handleSave = async () => {
    const value = content.trim();
    if (!value) {
      setError('Nội dung không được để trống.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsertDimChunk(diseaseSlug, { chieu, content: value });
      setDraft(null); // đã lưu → bỏ nháp để hiện giá trị server vừa trả về
      onSaved();
    } catch (err) {
      console.error(err);
      // Lỗi hay gặp nhất: hết quota Gemini → backend không lưu, nội dung cũ giữ nguyên.
      setError(errMessage(err, 'Lưu thất bại — chưa sinh được vector nên chưa lưu.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(null); // bỏ bản nháp → quay lại đúng giá trị đang có trên server
    setError(null);
    onClose();
  };

  const runAction = async (fn: () => Promise<unknown>, fallbackMsg: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onSaved();
    } catch (err) {
      console.error(err);
      setError(errMessage(err, fallbackMsg));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (!chunk) return;
    if (!confirm(`Xóa chiều "${DIM_LABEL[chieu]}" của bệnh này?`)) return;
    runAction(() => deleteDimChunk(chunk._id), 'Xóa thất bại');
  };

  // Chiều "dùng được" = có chunk, đang bật, và có vector hợp lệ.
  const dungDuoc = !!chunk && chunk.isActive && chunk.hasEmbedding;

  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-700">
              {DIM_LABEL[chieu]}
            </span>

            {!chunk && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                chưa có
              </span>
            )}
            {chunk && !chunk.hasEmbedding && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                <IAlert />
                chưa có vector — không được chấm điểm
              </span>
            )}
            {chunk && !chunk.isActive && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                đang tắt
              </span>
            )}
            {dungDuoc && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                đang dùng
              </span>
            )}
          </div>

          {!isOpen && (
            <p
              className={`mt-1 text-sm ${
                chunk ? 'text-gray-700' : 'italic text-gray-300'
              }`}
            >
              {chunk?.content || `— ${DIM_HINT[chieu]} —`}
            </p>
          )}
        </div>

        {!isOpen && (
          <div className="flex shrink-0 items-center gap-1">
            {chunk && !chunk.hasEmbedding && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() => reEmbedDimChunk(chunk._id), 'Sinh vector thất bại')
                }
                title="Sinh lại vector từ nội dung đang có"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                <IRotate />
                Sinh vector
              </button>
            )}
            {chunk && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => setDimChunkActive(chunk._id, !chunk.isActive),
                    'Đổi trạng thái thất bại',
                  )
                }
                title={
                  chunk.isActive
                    ? 'Tắt chiều này (không tham gia chấm điểm)'
                    : 'Bật lại chiều này'
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:border-[#007e42] hover:text-[#007e42] disabled:opacity-50"
              >
                {chunk.isActive ? <IEyeOff /> : <IEye />}
              </button>
            )}
            <button
              type="button"
              onClick={onOpen}
              title={chunk ? 'Sửa nội dung' : 'Thêm nội dung cho chiều này'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:border-[#007e42] hover:text-[#007e42]"
            >
              <IPencil />
            </button>
            {chunk && (
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                title="Xóa chiều này"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
              >
                <ITrash />
              </button>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="mt-2 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={500}
            autoFocus
            placeholder={DIM_HINT[chieu]}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-gray-400">
              {content.trim().length}/500 — lưu là sinh lại vector ngay.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-9 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)',
                }}
              >
                {saving ? 'Đang sinh vector...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-start gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
          <IAlert />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
