import { Button } from './button';
import { cn } from '@/utils/cn';

/**
 * Paginador genérico server-side.
 *
 * Props:
 *   page         → página activa (number)
 *   totalPages   → total de páginas del backend (number)
 *   totalItems   → total de registros filtrados — para la etiqueta informativa (number, opcional)
 *   onPageChange → callback (newPage: number) => void
 *   loading      → deshabilita los botones mientras carga (boolean, opcional)
 *   variant      → 'bar' (default, para tablas) | 'floating' (para mobile)
 *
 * Regla estricta: este componente NUNCA calcula páginas.
 * Solo navega entre las que el backend declaró.
 */
export const Pagination = ({
    page,
    totalPages,
    totalItems,
    onPageChange,
    loading = false,
    variant = 'bar',
    className,
}) => {
    if (!totalPages || totalPages <= 1) return null;

    const isFirst = page <= 1;
    const isLast = page >= totalPages;

    const goTo = (newPage) => {
        if (loading) return;
        if (newPage < 1 || newPage > totalPages) return;
        onPageChange(newPage);
    };

    // ── Variante barra (desktop / tabla) ──────────────────────────────────
    if (variant === 'bar') {
        return (
            <div className={cn(
                "flex flex-col sm:flex-row justify-between items-center",
                "px-4 py-3 bg-slate-50 border border-slate-300 rounded-b-lg gap-3",
                className
            )}>
                {/* Info */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <span className="text-xs text-slate-600 font-medium">
                        Página{' '}
                        <span className="font-bold text-slate-900">{page}</span>
                        {' '}de{' '}
                        <span className="font-bold text-slate-900">{totalPages}</span>
                    </span>
                    <span className="hidden sm:block text-slate-300">|</span>
                    <span className="text-[11px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full font-medium">
                        {totalItems
                            ? `${totalItems} registros en total`
                            : 'cargando...'}
                    </span>
                </div>

                {/* Controles */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => goTo(page - 1)}
                        disabled={isFirst || loading}
                        variant="outline"
                        size="sm"
                    >
                        Anterior
                    </Button>

                    {/* Números de página — máximo 5 visibles */}
                    <PageNumbers page={page} totalPages={totalPages} goTo={goTo} loading={loading} />

                    <Button
                        onClick={() => goTo(page + 1)}
                        disabled={isLast || loading}
                        variant="success"
                        size="sm"
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        );
    }

    // ── Variante flotante (mobile) ─────────────────────────────────────────
    return (
        <div className={cn(
            // CAMBIO: De bottom-6 a bottom-24 (96px) para evitar choque con el MobileBottomNav
            "fixed bottom-24 left-0 right-0 flex justify-center z-40 pb-2 transition-all duration-300",
            className
        )}>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 shadow-lg">
                <Button
                    onClick={() => goTo(page - 1)}
                    disabled={isFirst || loading}
                    variant="ghost"
                    size="icon"
                    icon="chevron_left"
                    className="h-7 w-7 rounded-full shadow-none hover:translate-y-0 hover:shadow-none"
                    aria-label="Página anterior"
                />

                <div className="text-center min-w-20">
                    <p className="text-xs font-bold text-slate-700 leading-tight">
                        {page} / {totalPages}
                    </p>
                    {totalItems > 0 && (
                        <p className="text-[10px] text-slate-400 leading-tight">
                            {totalItems} registros
                        </p>
                    )}
                </div>

                <Button
                    onClick={() => goTo(page + 1)}
                    disabled={isLast || loading}
                    variant="success"
                    size="icon"
                    icon="chevron_right"
                    className="h-7 w-7 rounded-full shadow-sm hover:translate-y-0"
                    aria-label="Página siguiente"
                />
            </div>
        </div>
    );
};

// ── Sub-componente interno: numeración de páginas ──────────────────────────
const PageNumbers = ({ page, totalPages, goTo, loading }) => {
    if (totalPages <= 1) return null;

    // Calcula el rango visible: máximo 5 números centrados en la página activa
    const delta = 2;
    const rangeStart = Math.max(1, page - delta);
    const rangeEnd = Math.min(totalPages, page + delta);
    const pages = [];

    for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
    }

    return (
        <div className="hidden sm:flex gap-1">
            {rangeStart > 1 && (
                <>
                    <PageBtn n={1} active={page === 1} goTo={goTo} loading={loading} />
                    {rangeStart > 2 && <span className="px-1 text-slate-400 self-center text-xs">…</span>}
                </>
            )}

            {pages.map(n => (
                <PageBtn key={n} n={n} active={page === n} goTo={goTo} loading={loading} />
            ))}

            {rangeEnd < totalPages && (
                <>
                    {rangeEnd < totalPages - 1 && <span className="px-1 text-slate-400 self-center text-xs">…</span>}
                    <PageBtn n={totalPages} active={page === totalPages} goTo={goTo} loading={loading} />
                </>
            )}
        </div>
    );
};

const PageBtn = ({ n, active, goTo, loading }) => (
    <Button
        onClick={() => goTo(n)}
        disabled={active || loading}
        variant={active ? 'success' : 'outline'}
        size="icon"
        className={cn(
            "h-7 w-7 rounded-md text-xs hover:translate-y-0",
            active && "cursor-default"
        )}
    >
        {n}
    </Button>
);
