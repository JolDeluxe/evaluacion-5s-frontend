import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function ImageViewer({
  open,
  src,
  images = [],
  activeIndex: controlledIndex,
  onIndexChange,
  alt = 'Imagen',
  title,
  onClose,
  className,
}) {
  const [internalIndex, setInternalIndex] = useState(0);

  // Sync internal index when controlled index or images change
  useEffect(() => {
    if (controlledIndex !== undefined) {
      setInternalIndex(controlledIndex);
    }
  }, [controlledIndex, open]);

  const isList = Array.isArray(images) && images.length > 0;
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const total = isList ? images.length : 1;

  const handleIndexChange = useCallback((nextIndex) => {
    const validIndex = (nextIndex + total) % total;
    if (onIndexChange) {
      onIndexChange(validIndex);
    } else {
      setInternalIndex(validIndex);
    }
  }, [total, onIndexChange]);

  const currentImage = isList ? images[activeIndex] : null;
  const activeSrc = isList
    ? (currentImage?.url || currentImage?.src || (typeof currentImage === 'string' ? currentImage : ''))
    : src;
  const activeTitle = isList
    ? (currentImage?.title || currentImage?.label || title)
    : title;
  const activeAlt = isList
    ? (currentImage?.alt || currentImage?.title || currentImage?.label || alt)
    : alt;

  const isOpen = Boolean(open && activeSrc);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowLeft' && isList && total > 1) {
        handleIndexChange(activeIndex - 1);
      } else if (e.key === 'ArrowRight' && isList && total > 1) {
        handleIndexChange(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isList, total, activeIndex, handleIndexChange, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/92 p-3 sm:p-5 md:p-6 animate-in fade-in duration-150 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={activeTitle || activeAlt}
    >
      {/* Top Bar */}
      <div className="flex w-full items-center justify-between gap-4 z-20" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          {total > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-black tracking-wide text-white/90 backdrop-blur shadow-sm">
              <span>{activeIndex + 1}</span>
              <span className="opacity-50">/</span>
              <span>{total}</span>
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          icon="close"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white hover:translate-y-0 hover:shadow-none transition shrink-0"
          aria-label="Cerrar imagen"
        />
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex max-h-[78vh] w-full max-w-5xl flex-1 items-center justify-center my-auto px-2 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isList && total > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              icon="chevron_left"
              onClick={() => handleIndexChange(activeIndex - 1)}
              className="absolute left-2 sm:left-4 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 text-white hover:bg-black/90 hover:text-white hover:translate-y-0 shadow-2xl border border-white/20 backdrop-blur-sm"
              aria-label="Imagen anterior"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              icon="chevron_right"
              onClick={() => handleIndexChange(activeIndex + 1)}
              className="absolute right-2 sm:right-4 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 text-white hover:bg-black/90 hover:text-white hover:translate-y-0 shadow-2xl border border-white/20 backdrop-blur-sm"
              aria-label="Imagen siguiente"
            />
          </>
        )}
        <img
          src={activeSrc}
          alt={activeAlt}
          className={cn(
            'max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-200',
            className,
          )}
        />
      </div>

      {/* Bottom Title / Description */}
      {activeTitle && (
        <div
          className="w-full max-w-2xl px-2 text-center z-20 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inline-block max-w-full max-h-[96px] overflow-y-auto custom-scrollbar rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold text-white/95 backdrop-blur-md shadow-lg text-center leading-relaxed whitespace-normal break-words border border-white/10">
            {activeTitle}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
