import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { imageUrl } from '../utils/format.js';
import { categoryImage } from '../utils/categoryMeta.js';
import { cn } from '../lib/cn.js';

export default function ImageGallery({ images = [], title = 'Listing', category = '' }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(() => new Set());
  const fallbackImg = category ? categoryImage(category) : '/images/categories/textbooks.jpg';

  useEffect(() => {
    setActive(0);
    setFailed(new Set());
  }, [images]);

  const available = images.filter((_, index) => !failed.has(index));
  const current = images[active];
  const hasImages = images.length > 0;
  const isFallback = !hasImages || failed.has(active);

  function move(direction) {
    if (!images.length) return;
    setActive((currentIndex) => (currentIndex + direction + images.length) % images.length);
  }

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-[#ECE8DE]">
        {isFallback ? (
          <div className="relative h-full w-full">
            <img
              src={fallbackImg}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-medium text-ink shadow-sm backdrop-blur-sm">
              Category reference photo
            </span>
          </div>
        ) : (
          <img
            src={imageUrl(current)}
            alt={`${title} — photo ${active + 1}`}
            className="h-full w-full object-contain"
            onError={() => setFailed((previous) => new Set(previous).add(active))}
          />
        )}


        {available.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-sm transition hover:bg-white focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-sm transition hover:bg-white focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {available.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/65 px-2.5 py-1 text-[10px] font-medium text-white">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label="Listing photos">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 bg-[#ECE8DE] transition',
                active === index ? 'border-forest-600' : 'border-transparent hover:border-line'
              )}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={active === index}
            >
              {failed.has(index) ? (
                <span className="grid h-full place-items-center text-muted">
                  <ImageOff className="h-4 w-4" />
                </span>
              ) : (
                <img
                  src={imageUrl(image)}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setFailed((previous) => new Set(previous).add(index))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
