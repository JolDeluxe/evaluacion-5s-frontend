import { Select } from '@/components/form/select';

export function SelectAuditor({ value, onChange, auditores = [], responsablesIds = [], disabled = false, auditorLabelFn }) {
  const selectedId = value ? Number(value) : null;

  return (
    <Select
      value={value ? String(value) : ''}
      onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      disabled={disabled}
    >
      <option value="">Selecciona auditor</option>
      {auditores
        .filter((auditor) => {
          // Si es el usuario ya asignado actualmente, mantenerlo visible para no romper lectura histórica
          if (selectedId && auditor.id === selectedId) return true;
          // Excluir si es responsable del área
          if (responsablesIds.includes(auditor.id)) return false;
          // Excluir si explícitamente no puede ser asignado
          if (auditor.puedeSerAsignadoAuditoria === false) return false;
          return true;
        })
        .map((auditor) => {
          const noDisponible = auditor.puedeSerAsignadoAuditoria === false;
          const baseLabel = auditorLabelFn ? auditorLabelFn(auditor) : auditor.nombre;
          const label = noDisponible ? `${baseLabel} (No disponible para nuevas asignaciones)` : baseLabel;

          return (
            <option
              key={auditor.id}
              value={auditor.id}
              disabled={noDisponible && auditor.id !== selectedId}
            >
              {label}
            </option>
          );
        })}
    </Select>
  );
}
