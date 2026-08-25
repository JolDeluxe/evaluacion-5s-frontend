import { Button } from '@/components/ui/button';

export function NavegacionAuditoria({ atrasLabel = 'Anterior', siguienteLabel = 'Siguiente', onBack, onNext, disabledNext, loadingNext }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/75 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-2xl grid-cols-[0.9fr_1.1fr] gap-3">
        <Button type="button" variant="ghost" size="lg" icon="arrow_back" className="min-h-12 rounded-2xl" onClick={onBack}>
          {atrasLabel}
        </Button>
        <Button type="button" size="lg" icon="arrow_forward" className="min-h-12 rounded-2xl" onClick={onNext} disabled={disabledNext} isLoading={loadingNext}>
          {siguienteLabel}
        </Button>
      </div>
    </div>
  );
}
