import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export function EvidenciaResultado({ evidencia, index, onOpen }) {
  const [showPreview, setShowPreview] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top' });
  const thumbRef = useRef(null);

  const handleMouseEnter = () => {
    if (!thumbRef.current) return;
    const rect = thumbRef.current.getBoundingClientRect();
    const previewWidth = 240;
    const previewHeight = 240;
    const padding = 12;

    let placement = 'top';
    let top = rect.top - previewHeight - padding;
    if (top < padding) {
      top = rect.bottom + padding;
      placement = 'bottom';
    }

    let left = rect.left + rect.width / 2 - previewWidth / 2;
    if (left < padding) left = padding;
    if (left + previewWidth > window.innerWidth - padding) {
      left = window.innerWidth - padding - previewWidth;
    }

    setCoords({ top, left, placement });
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <>
      <button
        ref={thumbRef}
        type="button"
        onClick={() => onOpen(index)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative h-16 w-16 overflow-hidden rounded-lg border border-app-border bg-slate-100 transition hover:border-slate-400 hover:shadow-sm focus-visible:outline-focus-ring"
        aria-label={`Ver evidencia ${index + 1}`}
      >
        <img
          src={evidencia.url}
          alt={`Evidencia ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </button>

      {showPreview &&
        createPortal(
          <div
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="fixed z-[9990] hidden md:block pointer-events-none w-60 h-60 rounded-xl overflow-hidden border border-slate-700/30 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          >
            <img
              src={evidencia.url}
              alt={`Vista previa evidencia ${index + 1}`}
              className="h-full w-full object-contain rounded-lg"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
