import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

function formatFecha(fechaStr) {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const anio = fecha.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

export function DelegacionesTable({ delegaciones = [], onToggleActiva, onEliminar }) {
  if (delegaciones.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center shadow-sm">
        <Icon name="swap_horiz" size="xl" className="mx-auto text-slate-400 mb-2" />
        <h3 className="text-base font-black text-slate-800">No hay delegaciones con este filtro</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No se encontraron registros de delegación que coincidan con el criterio seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-xl backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200/70 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3.5">Ejecutor</th>
              <th className="px-4 py-3.5">Responsable KPI</th>
              <th className="px-4 py-3.5">Vigente Desde</th>
              <th className="px-4 py-3.5">Vigente Hasta</th>
              <th className="px-4 py-3.5 text-center">Estado</th>
              <th className="px-4 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {delegaciones.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="font-black text-slate-900 leading-snug">
                    {d.ejecutor?.nombre || `Usuario #${d.ejecutorId}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {d.ejecutor?.nombreUsuario ? `@${d.ejecutor.nombreUsuario}` : ''} {d.ejecutor?.rol ? `· ${d.ejecutor.rol}` : ''}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-black text-indigo-950 leading-snug">
                    {d.responsable?.nombre || `Usuario #${d.responsableId}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {d.responsable?.nombreUsuario ? `@${d.responsable.nombreUsuario}` : ''} {d.responsable?.rol ? `· ${d.responsable.rol}` : ''}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                  {formatFecha(d.vigenteDesde) || '—'}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                  {formatFecha(d.vigenteHasta) || 'Indefinida'}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      d.activa
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${d.activa ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {d.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onToggleActiva?.(d)}
                  >
                    {d.activa ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() => onEliminar?.(d)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
