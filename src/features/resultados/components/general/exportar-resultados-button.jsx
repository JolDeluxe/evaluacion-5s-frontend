import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExportarResultadosModal } from '@/features/resultados/components/general/exportar-resultados-modal';

export function ExportarResultadosButton({ rangoParams = {}, data = null, className }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon="picture_as_pdf"
        onClick={() => setModalOpen(true)}
        className={className}
        aria-label="Exportar PDF"
      >
        Exportar PDF
      </Button>

      <ExportarResultadosModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rangoInicial={rangoParams}
        dataInicial={data}
      />
    </>
  );
}
