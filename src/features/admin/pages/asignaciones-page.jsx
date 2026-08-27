import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useUrlState, parseMonthParam, parseYearParam } from '@/hooks/use-url-state';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import { asignacionesApi } from '@/features/admin/api/asignaciones-api';
import { cn } from '@/utils/cn';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'ASIGNADO', label: 'Asignados' },
  { value: 'SIN_AUDITOR', label: 'Sin auditor' },
];

function EstadoBadge({ estado, excepcion }) {
  const asignado = estado === 'ASIGNADO';
  return (
    <div className="flex flex-wrap gap-1">
      <span className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wide',
        asignado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      )}>
        {asignado ? 'Asignado' : 'Sin auditor'}
      </span>
      {excepcion && (
        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-blue-700">
          P2 modificado
        </span>
      )}
    </div>
  );
}

function periodoTexto(periodo, fallback) {
  if (!periodo?.programada) return 'No programada';
  return periodo.auditorEfectivo?.nombre ?? fallback ?? 'Sin auditor';
}

function PeriodosResumen({ fila }) {
  return (
    <div className="space-y-1 text-xs font-bold text-slate-600">
      <p>P1: {periodoTexto(fila.periodos.p1, fila.auditorMensual?.nombre)}</p>
      <p>
        P2: {periodoTexto(fila.periodos.p2, fila.auditorMensual?.nombre)}
        {fila.periodos.p2?.programada && !fila.periodos.p2.usaAuditorMensual && fila.periodos.p2.auditorEfectivo ? ' · Excepción' : ''}
      </p>
    </div>
  );
}

function MonthPicker({ anio, mes, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="w-44">
        <Label>Mes</Label>
        <Select value={String(mes)} onChange={(event) => onChange({ anio, mes: Number(event.target.value) })}>
          {MESES.map((nombre, index) => <option key={nombre} value={index + 1}>{nombre}</option>)}
        </Select>
      </div>
      <div className="w-32">
        <Label>Año</Label>
        <Input type="number" value={anio} min="2020" max="2100" onChange={(event) => onChange({ anio: Number(event.target.value), mes })} />
      </div>
      <Button variant="ghost" icon="chevron_left" onClick={() => {
        const anterior = mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
        onChange(anterior);
      }}>
        Anterior
      </Button>
      <Button variant="ghost" icon="chevron_right" onClick={() => {
        const siguiente = mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };
        onChange(siguiente);
      }}>
        Siguiente
      </Button>
    </div>
  );
}

function SelectAuditor({ value, onChange, auditores, responsablesIds = [], disabled = false }) {
  return (
    <Select value={value ? String(value) : ''} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)} disabled={disabled}>
      <option value="">Selecciona auditor</option>
      {auditores
        .filter((auditor) => !responsablesIds.includes(auditor.id))
        .map((auditor) => (
          <option key={auditor.id} value={auditor.id}>
            {auditor.nombre}
          </option>
        ))}
    </Select>
  );
}

function EditarAsignacionModal({ fila, auditores, anio, mes, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    auditorMensualId: fila.auditorMensual?.id ?? '',
    p1UsaMensual: fila.periodos.p1?.usaAuditorMensual !== false,
    p2UsaMensual: fila.periodos.p2?.usaAuditorMensual !== false,
    p1AuditorId: fila.periodos.p1?.auditorEfectivo?.id ?? '',
    p2AuditorId: fila.periodos.p2?.auditorEfectivo?.id ?? '',
    p1Motivo: fila.periodos.p1?.motivoExcepcion ?? '',
    p2Motivo: fila.periodos.p2?.motivoExcepcion ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((actual) => ({ ...actual, [key]: value }));
  const p1Bloqueada = fila.periodos.p1?.bloqueada;
  const p2Bloqueada = fila.periodos.p2?.bloqueada;

  const reabrirPeriodo = async (periodo) => {
    const motivo = window.prompt('Motivo de la reapertura');
    if (!motivo?.trim()) return;
    setSaving(true);
    setError('');
    try {
      await asignacionesApi.reabrir(periodo.asignacionId, { motivo });
      onSaved();
    } catch (err) {
      setError(err?.message || 'No se pudo reabrir el periodo.');
    } finally {
      setSaving(false);
    }
  };

  const guardar = async (event) => {
    event.preventDefault();
    if (!form.auditorMensualId) {
      setError('Selecciona un auditor mensual.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await asignacionesApi.guardarMensual(fila.area.id, {
        anio,
        mes,
        auditorMensualId: Number(form.auditorMensualId),
        periodos: {
          p1: {
            usaAuditorMensual: form.p1UsaMensual,
            auditorId: form.p1UsaMensual ? null : Number(form.p1AuditorId),
            motivo: form.p1Motivo || null,
          },
          p2: {
            usaAuditorMensual: form.p2UsaMensual,
            auditorId: form.p2UsaMensual ? null : Number(form.p2AuditorId),
            motivo: form.p2Motivo || null,
          },
        },
      });
      onSaved();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la asignación.');
    } finally {
      setSaving(false);
    }
  };

  const renderPeriodo = (key, label, periodo, bloqueada) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-slate-950">{label}</p>
          {!periodo?.programada && <p className="text-xs font-bold text-slate-500">No programada para esta área.</p>}
          {bloqueada && <p className="text-xs font-bold text-red-600">{periodo.realizada ? 'Realizada · bloqueada' : 'Vencida · bloqueada'}</p>}
        </div>
        {periodo?.vencida && periodo.asignacionId && (
          <Button type="button" variant="outline" size="sm" icon="lock_open" isLoading={saving} onClick={() => reabrirPeriodo(periodo)}>
            Reabrir
          </Button>
        )}
        {periodo?.programada && (
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form[`${key}UsaMensual`]}
              disabled={bloqueada}
              onChange={(event) => setField(`${key}UsaMensual`, event.target.checked)}
            />
            Usar auditor mensual
          </label>
        )}
      </div>
      {periodo?.programada && !form[`${key}UsaMensual`] && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Auditor {label}</Label>
            <SelectAuditor
              value={form[`${key}AuditorId`]}
              onChange={(value) => setField(`${key}AuditorId`, value)}
              auditores={auditores}
              responsablesIds={fila.area.responsablesIds}
              disabled={bloqueada}
            />
          </div>
          <div>
            <Label>Motivo</Label>
            <Input value={form[`${key}Motivo`]} onChange={(event) => setField(`${key}Motivo`, event.target.value)} disabled={bloqueada} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen onClose={onClose} className="max-w-3xl">
      <ModalHeader onClose={onClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">{MESES[mes - 1]} {anio}</p>
          <h2 className="text-xl font-black text-slate-950">{fila.area.nombre}</h2>
        </div>
      </ModalHeader>
      <form onSubmit={guardar}>
        <ModalBody>
          <div className="space-y-4">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
            <div>
              <Label>Auditor del mes</Label>
              <SelectAuditor
                value={form.auditorMensualId}
                onChange={(value) => setField('auditorMensualId', value)}
                auditores={auditores}
                responsablesIds={fila.area.responsablesIds}
              />
              <p className="mt-1 text-xs font-bold text-slate-500">Este auditor realizará P1 y P2 de forma predeterminada.</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Excepciones por periodo</p>
              {renderPeriodo('p1', 'P1', fila.periodos.p1, p1Bloqueada)}
              {renderPeriodo('p2', 'P2', fila.periodos.p2, p2Bloqueada)}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="cancelar" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="guardar" isLoading={saving}>Guardar</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function MobileCard({ fila, onEdit }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-black leading-snug text-slate-950">{fila.area.nombre}</h3>
        </div>
        <EstadoBadge estado={fila.estado} excepcion={fila.tieneExcepcion} />
      </div>
      <div className="mt-3 grid gap-2 text-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auditor</p>
          <p className="font-bold text-slate-800">{fila.auditorMensual?.nombre ?? 'Sin auditor'}</p>
        </div>
        <PeriodosResumen fila={fila} />
      </div>
      <Button className="mt-3 w-full" variant="outline" icon="edit" onClick={() => onEdit(fila)}>
        {fila.estado === 'ASIGNADO' ? 'Editar' : 'Asignar'}
      </Button>
    </div>
  );
}

const URL_DEFAULTS_ASIGNACIONES = {
  q: '',
  estado: '',
  auditorId: '',
};

export function AsignacionesPage() {
  const { anio: anioParam, mes: mesParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ahora = useMemo(() => new Date(), []);
  const anio = parseYearParam(anioParam, ahora.getFullYear());
  const mes = parseMonthParam(mesParam, ahora.getMonth() + 1);

  const { params, setParam, setSearch } = useUrlState(URL_DEFAULTS_ASIGNACIONES);
  
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [editing, setEditing] = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async (currentAnio, currentMes, currentParams) => {
    setState((actual) => ({ ...actual, status: 'loading', error: null }));
    try {
      const queryParams = {
        anio: currentAnio,
        mes: currentMes,
        busqueda: currentParams.q, // Map q -> busqueda for API
        estado: currentParams.estado,
        auditorId: currentParams.auditor, // Map auditor -> auditorId
      };
      const data = await asignacionesApi.mensual(queryParams);
      setState({ status: 'ready', data, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: error?.message || 'No se pudieron cargar las asignaciones.' });
    }
  }, []);

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      cargar(anio, mes, params);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, mes, params.q, params.estado, params.auditor, cargar]);

  const handlePeriodo = ({ anio: a, mes: m }) => {
    navigate(`/admin/asignaciones/${a}/${m}${location.search}`);
  };

  const autoasignar = async () => {
    setAutoLoading(true);
    setMensaje('');
    try {
      const result = await asignacionesApi.autoasignar({ anio, mes });
      setMensaje(`${result.autoasignacion.asignadas} áreas asignadas. ${result.autoasignacion.sinCandidato} sin candidato.`);
      setState({ status: 'ready', data: result.vista, error: null });
    } catch (error) {
      setMensaje(error?.message || 'No se pudo autoasignar.');
    } finally {
      setAutoLoading(false);
    }
  };

  const data = state.data;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Administración</p>
          <h1 className="text-3xl font-black text-slate-950">Asignaciones</h1>
        </div>
        <MonthPicker anio={anio} mes={mes} onChange={handlePeriodo} />
      </div>

      {data && (
        <div className="grid gap-3 md:grid-cols-4">
          <Card><CardBody className="p-4"><p className="text-xs font-black uppercase text-slate-400">Áreas</p><p className="text-2xl font-black text-slate-950">{data.resumen.areas}</p></CardBody></Card>
          <Card><CardBody className="p-4"><p className="text-xs font-black uppercase text-slate-400">Asignadas</p><p className="text-2xl font-black text-emerald-700">{data.resumen.asignadas}</p></CardBody></Card>
          <Card><CardBody className="p-4"><p className="text-xs font-black uppercase text-slate-400">Sin auditor</p><p className="text-2xl font-black text-amber-700">{data.resumen.sinAuditor}</p></CardBody></Card>
          <Card><CardBody className="p-4"><Button className="w-full" icon="auto_fix_high" isLoading={autoLoading} onClick={autoasignar}>Autoasignar pendientes</Button></CardBody></Card>
        </div>
      )}

      <Card className="border-white/70 bg-white/80 shadow-lg shadow-slate-950/5">
        <CardBody className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Icon name="search" size="18px" />
              </span>
              <input
                value={params.q}
                onChange={(event) => setSearch('q', event.target.value)}
                placeholder="Buscar por área, código o auditor…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-marca-secundario"
              />
            </div>
            <Select value={params.estado} onChange={(event) => setParam('estado', event.target.value)}>
              {ESTADOS.map((estado) => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
            </Select>
            <Select value={params.auditor} onChange={(event) => setParam('auditor', event.target.value)}>
              <option value="">Todos los auditores</option>
              {(data?.auditores ?? []).map((auditor) => <option key={auditor.id} value={auditor.id}>{auditor.nombre}</option>)}
            </Select>
          </div>
          {mensaje && <p className="text-sm font-bold text-slate-600">{mensaje}</p>}
        </CardBody>
      </Card>

      {data?.auditores?.length > 0 && (
        <Card className="border-white/70 bg-white/75">
          <CardBody className="p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Carga del mes</p>
            <div className="flex flex-wrap gap-2">
              {data.auditores.map((auditor) => (
                <span key={auditor.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                  {auditor.nombre} · {auditor.areasAsignadas} áreas
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {state.status === 'loading' && <Spinner />}
      {state.status === 'error' && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}

      {state.status === 'ready' && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Área</th>
                  <th className="px-4 py-3 text-left">Auditor</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Periodos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.filas.map((fila) => (
                  <tr key={fila.area.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-black text-slate-950">{fila.area.nombre}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{fila.auditorMensual?.nombre ?? '—'}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={fila.estado} excepcion={fila.tieneExcepcion} /></td>
                    <td className="px-4 py-3"><PeriodosResumen fila={fila} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" icon="edit" onClick={() => setEditing(fila)}>
                        {fila.estado === 'ASIGNADO' ? 'Editar' : 'Asignar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.filas.length && <p className="p-8 text-center text-sm font-bold text-slate-500">No hay áreas con los filtros aplicados.</p>}
          </div>

          <div className="space-y-3 md:hidden">
            {data.filas.map((fila) => <MobileCard key={fila.area.id} fila={fila} onEdit={setEditing} />)}
            {!data.filas.length && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">No hay áreas con los filtros aplicados.</p>}
          </div>
        </>
      )}

      {editing && (
        <EditarAsignacionModal
          fila={editing}
          auditores={data?.auditores ?? []}
          anio={periodo.anio}
          mes={periodo.mes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            cargar();
          }}
        />
      )}
    </section>
  );
}
