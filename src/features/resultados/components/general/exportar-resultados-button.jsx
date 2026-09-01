import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExportarResultadosModal } from '@/features/resultados/components/general/exportar-resultados-modal';
import { cn } from '@/utils/cn';

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
        className={cn('shrink-0 px-3', className)}
        aria-label="Exportar resultados a PDF"
        title="Exportar resultados a PDF"
      >
        PDF
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
