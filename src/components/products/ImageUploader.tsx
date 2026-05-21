'use client';

import { useRef, useState } from 'react';
import { deleteProductImage, uploadProductImages } from '@/lib/products-api';
import type { ProductImage } from '@/types/product';

const MAX_FILES_PER_BATCH = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME = /^image\/(jpeg|png|webp|gif)$/;

function IUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IX() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface Props {
  productId?: string;
  existingImages: ProductImage[];
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  onExistingChanged: () => void;
}

export default function ImageUploader({
  productId,
  existingImages,
  pendingFiles,
  onPendingFilesChange,
  onExistingChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    if (files.length > MAX_FILES_PER_BATCH) {
      setError(`Tối đa ${MAX_FILES_PER_BATCH} ảnh mỗi lần`);
      return;
    }
    for (const f of files) {
      if (!ACCEPTED_MIME.test(f.type)) {
        setError(`File "${f.name}" không phải định dạng ảnh hợp lệ`);
        return;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setError(`File "${f.name}" vượt quá 5MB`);
        return;
      }
    }

    if (productId) {
      setWorking(true);
      try {
        await uploadProductImages(productId, files);
        onExistingChanged();
      } catch (err) {
        console.error(err);
        setError('Upload ảnh thất bại');
      } finally {
        setWorking(false);
      }
    } else {
      onPendingFilesChange([...pendingFiles, ...files]);
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const removePending = (index: number) => {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  };

  const removeExisting = async (publicId: string) => {
    if (!productId) return;
    if (!confirm('Xóa ảnh này khỏi sản phẩm và khỏi Cloudinary?')) return;
    setWorking(true);
    setError(null);
    try {
      await deleteProductImage(productId, publicId);
      onExistingChanged();
    } catch (err) {
      console.error(err);
      setError('Xóa ảnh thất bại');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {existingImages.map((img) => (
          <Thumb
            key={img.publicId}
            src={img.url}
            label="Cloudinary"
            onRemove={() => removeExisting(img.publicId)}
            disabled={working}
          />
        ))}
        {pendingFiles.map((file, idx) => (
          <Thumb
            key={`${file.name}-${idx}`}
            src={URL.createObjectURL(file)}
            label="Chờ upload"
            tone="pending"
            onRemove={() => removePending(idx)}
            disabled={working}
          />
        ))}

        <button
          type="button"
          onClick={handlePick}
          disabled={working}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#007e42]/30 bg-emerald-50/40 text-[11px] font-semibold text-[#007e42] transition hover:border-[#007e42] hover:bg-emerald-50 disabled:opacity-50"
        >
          <IUpload />
          {working ? 'Đang xử lý...' : 'Thêm ảnh'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

function Thumb({
  src,
  label,
  tone = 'existing',
  onRemove,
  disabled,
}: {
  src: string;
  label: string;
  tone?: 'existing' | 'pending';
  onRemove: () => void;
  disabled: boolean;
}) {
  const labelClass =
    tone === 'pending'
      ? 'bg-amber-500/90'
      : 'bg-[#007e42]/85';

  return (
    <div className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-full w-full object-cover" />
      <span
        className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-white ${labelClass}`}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        title="Xóa ảnh"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
      >
        <IX />
      </button>
    </div>
  );
}
