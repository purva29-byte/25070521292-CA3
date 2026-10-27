import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { imageUrl } from '../utils/format.js';
import { useToast } from '../context/ToastProvider.jsx';
import { cn } from '../lib/cn.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploader({
  files = [],
  onFilesChange,
  existingImages = [],
  onRemoveExisting,
  maxFiles = 6,
  disabled = false,
  error = '',
}) {
  const { notify } = useToast();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const total = files.length + existingImages.length;
  const remaining = Math.max(0, maxFiles - total);

  function addFiles(candidateFiles) {
    const incoming = Array.from(candidateFiles || []);
    if (!incoming.length) return;

    const errors = [];
    const accepted = [];
    for (const file of incoming) {
      if (!ALLOWED.includes(file.type)) {
        errors.push(`${file.name} is not a JPG, PNG, or WebP image.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name} is larger than 5 MB.`);
        continue;
      }
      accepted.push(file);
    }

    const room = Math.max(0, maxFiles - total);
    if (accepted.length > room) {
      errors.push(`You can add ${room} more image${room === 1 ? '' : 's'}.`);
    }

    if (accepted.length) onFilesChange([...files, ...accepted.slice(0, room)]);
    if (errors.length) notify.error(errors[0]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="field-label mb-0">Photos</span>
        <span className="text-xs text-muted">
          {total}/{maxFiles}
        </span>
      </div>
      <p className="field-hint mt-1">
        Add up to {maxFiles} clear photos. JPG, PNG, or WebP, up to 5 MB each.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {existingImages.map((image, index) => (
          <div key={image} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-canvas">
            <img src={imageUrl(image)} alt={`Existing photo ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(image)}
              disabled={disabled}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink/75 text-white transition hover:bg-red-700"
              aria-label={`Remove existing photo ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/65 px-1.5 py-0.5 text-[9px] font-medium text-white">
              Saved
            </span>
          </div>
        ))}

        {previews.map(({ file, url }, index) => (
          <div key={`${file.name}-${file.lastModified}`} className="group relative aspect-square overflow-hidden rounded-xl border border-forest-200 bg-canvas">
            <img src={url} alt={`Selected photo ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}
              disabled={disabled}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink/75 text-white transition hover:bg-red-700"
              aria-label={`Remove selected photo ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            disabled={disabled}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-2 text-center transition',
              dragging
                ? 'border-forest-500 bg-forest-50 text-forest-700'
                : 'border-line bg-canvas text-muted hover:border-forest-300 hover:text-forest-700'
            )}
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-4">Add photos</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
        disabled={disabled || remaining === 0}
      />

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
