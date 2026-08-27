import { Button } from '@/components/ui/button';
import { ordenarPorOrden } from '@/features/auditorias/components/formulario-dinamico.helpers';

export function OpcionesCriterio({ bloque, respuesta, onSelect }) {
  const seleccionadas = new Set(respuesta?.opcionFormularioIds ?? []);
  const opciones = [...(bloque?.opciones ?? [])]
    .filter((opcion) => opcion.activo !== false)
    .sort((a, b) => {
      if (a.valor === 'NO' && b.valor === 'SI') return -1;
      if (a.valor === 'SI' && b.valor === 'NO') return 1;
      return Number(a.orden ?? 0) - Number(b.orden ?? 0);
    });

  return (
    <div className="grid grid-cols-2 gap-3">
      {opciones.map((opcion) => {
        const activa = seleccionadas.has(opcion.id);
        const esPositiva = Number(opcion.valorPuntaje ?? 0) > 0;
        return (
          <Button
            key={opcion.id}
            type="button"
            variant={activa ? (esPositiva ? 'guardar' : 'borrar') : 'ghost'}
            size="lg"
            aria-pressed={activa}
            className="min-h-14 rounded-2xl text-base"
            icon={activa ? 'check_circle' : 'radio_button_unchecked'}
            onClick={() => onSelect(opcion)}
          >
            {opcion.etiqueta}
          </Button>
        );
      })}
    </div>
  );
}
