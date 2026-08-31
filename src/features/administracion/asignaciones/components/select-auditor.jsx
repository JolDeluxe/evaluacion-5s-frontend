import { Select } from '@/components/form/select';

export function SelectAuditor({ value, onChange, auditores, responsablesIds = [], disabled = false }) {
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
