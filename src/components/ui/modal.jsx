import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  size = 'md',
  closeOnBackdrop = true,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[var(--z-modal)]
        flex items-end justify-center
        bg-slate-950/55
        p-0
        backdrop-blur-sm
        animate-in fade-in duration-200
        sm:items-center sm:p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={cn(
          `
            relative
            flex max-h-[92dvh] w-full flex-col
            overflow-hidden
            rounded-t-3xl
            border-t border-x border-white/80
            bg-white/95
            backdrop-blur-xl
            shadow-2xl shadow-slate-950/20
            animate-in slide-in-from-bottom-3 duration-200

            sm:max-h-[90vh]
            sm:rounded-2xl
            sm:border
            sm:zoom-in-95
          `,
          sizes[size] || sizes.md,
          className,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-300/80" />
        </div>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          if (child.type !== ModalHeader) {
            return child;
          }

          return React.cloneElement(child, {
            titleId: child.props.titleId || titleId,
          });
        })}
      </div>
    </div>,
    document.body,
  );
};

export const ModalHeader = ({
  title,
  description,
  onClose,
  className = '',
  children,
  titleId,
}) => (
  <div
    className={cn(
      `
        relative
        shrink-0
        border-b border-app-border
        bg-white
        px-5 py-5 pr-16

        sm:px-6 sm:py-5 sm:pr-16
      `,
      className,
    )}
  >
    {children || (
      <div className="space-y-1.5 text-left">
        <h2
          id={titleId}
          className="
            fuente-titulos
            text-2xl
            font-normal
            uppercase
            leading-[1.1]
            text-marca-primario
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              text-sm
              font-semibold
              leading-5
              text-app-text-muted
            "
          >
            {description}
          </p>
        )}
      </div>
    )}

    {onClose && (
      <div className="absolute inset-y-0 right-4 flex items-center">
        <Button
          type="button"
          variant="icon"
          size="icon"
          icon="close"
          onClick={onClose}
          aria-label="Cerrar"
        />
      </div>
    )}
  </div>
);

export const ModalBody = ({
  children,
  className = '',
}) => (
  <div
    className={cn(
      `
        custom-scrollbar
        grow
        overflow-y-auto
        overflow-x-hidden
        p-5
        font-lectura

        sm:p-6
      `,
      className,
    )}
  >
    {children}
  </div>
);

export const ModalFooter = ({
  children,
  className = '',
}) => (
  <div
    className={cn(
      `
        shrink-0
        flex flex-col-reverse
        gap-2
        border-t border-app-border
        bg-app-surface-muted/65
        p-4

        sm:flex-row
        sm:justify-end
        sm:px-6
      `,
      className,
    )}
  >
    {children}
  </div>
);