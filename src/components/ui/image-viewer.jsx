import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function ImageViewer({
  open,
  src,
  images = [],
  activeIndex = 0,
  onIndexChange,
  alt = 'Imagen',
  title,
  onClose,
  className,
}) {
  const isList = images.length > 0;
  const currentImage = isList ? images[activeIndex] : null;
  const activeSrc = isList ? (currentImage?.url || currentImage?.src || currentImage) : src;
  const activeTitle = isList ? (currentImage?.title || currentImage?.label || title) : title;
  const activeAlt = isList ? (currentImage?.alt || currentImage?.title || alt) : alt;
  const total = isList ? images.length : 1;

  const isOpen = Boolean(open && activeSrc);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowLeft' && isList && total > 1 && onIndexChange) {
        onIndexChange((activeIndex - 1 + total) % total);
      } else if (e.key === 'ArrowRight' && isList && total > 1 && onIndexChange) {
        onIndexChange((activeIndex + 1) % total);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isList, total, activeIndex, onIndexChange, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/92 p-4 md:p-6 animate-in fade-in duration-150 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={activeTitle || activeAlt}
    >
      {/* Top Bar */}
      <div className="flex w-full items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          {total > 1 && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/80 backdrop-blur">
              {activeIndex + 1} / {total}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          icon="close"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white hover:translate-y-0 hover:shadow-none"
          aria-label="Cerrar imagen"
        />
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex max-h-[85vh] max-w-[92vw] flex-1 items-center justify-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isList && total > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              icon="chevron_left"
              onClick={() => onIndexChange?.((activeIndex - 1 + total) % total)}
              className="absolute left-2 md:-left-12 z-10 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white hover:translate-y-0 shadow-lg"
              aria-label="Imagen anterior"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              icon="chevron_right"
              onClick={() => onIndexChange?.((activeIndex + 1) % total)}
              className="absolute right-2 md:-right-12 z-10 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white hover:translate-y-0 shadow-lg"
              aria-label="Imagen siguiente"
            />
          </>
        )}
        <img
          src={activeSrc}
          alt={activeAlt}
          className={cn(
            'max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-all duration-200',
            className,
          )}
        />
      </div>

      {/* Bottom Title */}
      {activeTitle && (
        <div className="max-w-[90vw] text-center" onClick={(e) => e.stopPropagation()}>
          <p className="inline-block truncate rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
            {activeTitle}
          </p>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
