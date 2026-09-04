import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { AreaQrPrintCard } from '../components/area-qr-print-card';
import { areasApi } from '../api/areas-api';

export function AreaQrPrintPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const searchParams = new URLSearchParams(location.search);
    const idsParam = searchParams.get('ids');
    const stateAreas = location.state?.selectedAreas;

    const cargarAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        if (stateAreas && Array.isArray(stateAreas) && stateAreas.length > 0) {
          if (active) {
            setAreas(stateAreas);
            setLoading(false);
          }
          return;
        }

        let targetIds = [];
        if (idsParam) {
          targetIds = idsParam.split(',').map((id) => Number(id.trim())).filter((id) => Boolean(id) && !Number.isNaN(id));
        }

        if (targetIds.length === 0) {
          if (active) {
            setAreas([]);
            setLoading(false);
          }
          return;
        }

        const response = await areasApi.listar({ limite: 100, activo: true });
        const allAreas = response?.datos ?? [];
        const filtered = allAreas.filter((a) => targetIds.includes(a.id));
        
        if (active) {
          setAreas(filtered.length > 0 ? filtered : allAreas);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Error al cargar las áreas para impresión.');
          setLoading(false);
        }
      }
    };

    cargarAreas();

    return () => {
      active = false;
    };
  }, [location.search, location.state]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="text-sm font-bold">{error}</p>
        </div>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/areas')}>
          Volver a Áreas
        </Button>
      </div>
    );
  }

  if (!areas || areas.length === 0) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <Icon name="search_off" size="48px" className="mx-auto text-slate-300" />
        <h2 className="mt-3 text-lg font-black text-slate-900">No hay áreas seleccionadas</h2>
        <p className="mt-1 text-xs text-slate-500">Selecciona al menos un área desde el catálogo para imprimir su QR.</p>
        <Button variant="primario" size="sm" className="mt-5" onClick={() => navigate('/admin/areas')}>
          Volver a Áreas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16 print:bg-white print:pb-0">
      {/* Toolbar superior (pantalla) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 shadow-sm backdrop-blur-md no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="arrow_back"
            onClick={() => navigate('/admin/areas')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Volver a Áreas
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">Impresión de QR</p>
            <h1 className="text-sm font-black text-slate-900 leading-none">
              {areas.length} {areas.length === 1 ? 'área lista' : 'áreas listas'} para imprimir
            </h1>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="primario"
            size="md"
            icon="print"
            onClick={handlePrint}
            className="text-xs font-bold px-5"
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Vista previa y hojas imprimibles */}
      <main className="mx-auto max-w-4xl pt-6 px-4 print:p-0 print:m-0 print:max-w-none">
        <div id="printable-area-root" className="space-y-8 print:space-y-0">
          {areas.map((area) => (
            <section
              key={area.id}
              className="area-qr-print-page bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:rounded-none print:border-none print:shadow-none print:p-0"
            >
              <AreaQrPrintCard area={area} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
