import { Select } from '@/components/form/select';

export function EditorReglas({ bloque, reglas, onChange, readOnly }) {
  const opciones = bloque.opciones ?? [];
  const primera = opciones[0]?.claveEstable ?? '';
  const reglaHallazgo = reglas.find((regla) => regla.bloqueOrigenClaveEstable === bloque.claveEstable && regla.accion === 'EXIGIR_HALLAZGO');
  const reglaEvidencia = reglas.find((regla) => regla.bloqueOrigenClaveEstable === bloque.claveEstable && regla.accion === 'EXIGIR_EVIDENCIA');
  const opcionClave = reglaHallazgo?.opcionOrigenClaveEstable ?? reglaEvidencia?.opcionOrigenClaveEstable ?? opciones.find((opcion) => opcion.valor === 'NO')?.claveEstable ?? primera;

  const setRegla = (accion, checked) => {
    const restantes = reglas.filter((regla) => !(regla.bloqueOrigenClaveEstable === bloque.claveEstable && regla.accion === accion));
    if (!checked) {
      onChange(restantes);
      return;
    }
    onChange([
      ...restantes,
      {
        bloqueOrigenClaveEstable: bloque.claveEstable,
        opcionOrigenClaveEstable: opcionClave,
        operador: 'IGUAL',
        accion,
        activo: true,
      },
    ]);
  };

  const cambiarOpcion = (clave) => {
    onChange(reglas.map((regla) => (
      regla.bloqueOrigenClaveEstable === bloque.claveEstable
        ? { ...regla, opcionOrigenClaveEstable: clave }
        : regla
    )));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Reglas 5S</p>
      <div className="max-w-xs">
        <Select value={opcionClave} disabled={readOnly} onChange={(event) => cambiarOpcion(event.target.value)}>
          {opciones.map((opcion) => <option key={opcion.claveEstable} value={opcion.claveEstable}>{opcion.etiqueta}</option>)}
        </Select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
          <input type="checkbox" disabled={readOnly} checked={Boolean(reglaHallazgo)} onChange={(event) => setRegla('EXIGIR_HALLAZGO', event.target.checked)} />
          Requerir hallazgo
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
          <input type="checkbox" disabled={readOnly} checked={Boolean(reglaEvidencia)} onChange={(event) => setRegla('EXIGIR_EVIDENCIA', event.target.checked)} />
          Requerir evidencia
        </label>
      </div>
    </div>
  );
}
