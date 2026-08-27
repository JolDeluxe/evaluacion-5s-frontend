import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function ImageViewer({
  open,
  src,
  alt = 'Imagen',
  title,
  onClose,
  className,
}) {
  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || alt}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        icon="close"
        onClick={onClose}
        className="absolute right-4 top-4 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-white/10 hover:text-white hover:translate-y-0 hover:shadow-none"
        aria-label="Cerrar imagen"
      />
      <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className={cn('max-h-[82dvh] max-w-full rounded-lg object-contain shadow-2xl', className)}
        />
        {title && (
          <p className="max-w-[90vw] truncate rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/85 backdrop-blur">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
