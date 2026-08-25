import { cn } from '@/utils/cn';

const styles = {
  BORRADOR: 'border-amber-200 bg-amber-50 text-amber-800',
  PUBLICADA: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  ARCHIVADA: 'border-slate-200 bg-slate-100 text-slate-600',
};

export function EstadoVersionBadge({ estado }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em]', styles[estado] ?? styles.ARCHIVADA)}>
      {estado}
    </span>
  );
}
