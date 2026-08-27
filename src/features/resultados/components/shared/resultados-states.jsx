import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';

export function ResultadosLoading() {
  return (
    <div className="flex justify-center py-14">
      <Spinner size="44px" />
    </div>
  );
}

export function ResultadosError({ message }) {
  return (
    <Card variant="danger">
      <CardBody className="flex items-start gap-3 text-sm font-semibold text-rose-800">
        <Icon name="error" size="20px" className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </CardBody>
    </Card>
  );
}

export function ResultadosEmpty({ title = 'No hay resultados disponibles para este mes.', description }) {
  return (
    <Card variant="muted" className="border-dashed">
      <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
          <Icon name="monitoring" size="26px" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-800">{title}</h2>
          {description && (
            <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
