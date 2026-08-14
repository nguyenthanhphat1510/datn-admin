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

/** Nút icon trong bảng — giống IconBtn nhưng có thêm `disabled` cho thao tác async. */
function RowBtn({
  children,
  onClick,
  title,
  tone = 'default',
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-500 hover:border-red-200 hover:bg-red-50'
      : 'text-gray-500 hover:border-[#007e42]/20 hover:bg-emerald-50 hover:text-[#007e42]';
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition disabled:opacity-40 ${toneClass}`}
    >
      {children}
    </button>
  );
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
 * Một HÀNG BẢNG = một dấu hiệu của một bệnh. Đang mở sửa thì ô nội dung biến thành
 * textarea, các cột khác giữ nguyên để bảng không bị nhảy layout.
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
    if (!confirm(`Xóa mô tả "${DIM_LABEL[chieu]}" của bệnh này?`)) return;
    runAction(() => deleteDimChunk(chunk._id), 'Xóa thất bại');
  };

  return (
    <tr className="align-top transition hover:bg-emerald-50/40">
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">
          {DIM_LABEL[chieu]}
        </span>
      </td>

      <td className="px-4 py-3">
        {isOpen ? (
          <div className="space-y-2">
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
        ) : (
          <p
            className={`text-sm leading-relaxed ${
              chunk ? 'text-gray-700' : 'italic text-gray-400'
            }`}
          >
            {chunk?.content || DIM_HINT[chieu]}
          </p>
        )}

        {error && (
          <p className="mt-2 flex items-start gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
            <IAlert />
            <span>{error}</span>
          </p>
        )}
      </td>

      <td className="px-4 py-3 text-sm">
        {!chunk ? (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Chưa có
          </span>
        ) : !chunk.hasEmbedding ? (
          <span
            title="Chưa sinh được vector nên dấu hiệu này không tham gia chấm điểm"
            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700"
          >
            <IAlert />
            Lỗi vector
          </span>
        ) : !chunk.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            <IEyeOff />
            Đang tắt
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#007e42]">
            <IEye />
            Đang dùng
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          {!isOpen && (
            <>
              {chunk && !chunk.hasEmbedding && (
                <RowBtn
                  title="Sinh lại vector từ nội dung đang có"
                  tone="danger"
                  disabled={busy}
                  onClick={() =>
                    runAction(() => reEmbedDimChunk(chunk._id), 'Sinh vector thất bại')
                  }
                >
                  <IRotate />
                </RowBtn>
              )}
              {chunk && (
                <RowBtn
                  title={
                    chunk.isActive
                      ? 'Tắt dấu hiệu này (không tham gia chấm điểm)'
                      : 'Bật lại dấu hiệu này'
                  }
                  disabled={busy}
                  onClick={() =>
                    runAction(
                      () => setDimChunkActive(chunk._id, !chunk.isActive),
                      'Đổi trạng thái thất bại',
                    )
                  }
                >
                  {chunk.isActive ? <IEyeOff /> : <IEye />}
                </RowBtn>
              )}
              <RowBtn
                title={chunk ? 'Sửa nội dung' : 'Thêm nội dung cho dấu hiệu này'}
                onClick={onOpen}
              >
                <IPencil />
              </RowBtn>
              {chunk && (
                <RowBtn
                  title="Xóa nội dung dấu hiệu này"
                  tone="danger"
                  disabled={busy}
                  onClick={handleDelete}
                >
                  <ITrash />
                </RowBtn>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
