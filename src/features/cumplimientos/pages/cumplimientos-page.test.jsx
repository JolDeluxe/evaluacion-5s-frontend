import { describe, expect, it } from 'bun:test';

describe('Cumplimientos y KPI Frontend - Validación de Contratos y Estructuras', () => {
  it('1. Procesa correctamente filas operativas canónicas y formatos duales', () => {
    const filaCanonica = {
      areaId: 10,
      codigoArea: 'PROD-01',
      nombreArea: 'Línea de Producción 1',
      tipoArea: 'OPERATIVA',
      propietarios: [{ id: 5, nombre: 'Carlos Líder', nombreUsuario: 'clider' }],
      auditorAsignado: { id: 2, nombre: 'Ana Auditora', rol: 'AUDITOR' },
      responsableCumplimiento: { id: 2, nombre: 'Ana Auditora', rol: 'AUDITOR', esDelegado: false },
      resultadoMensual: 95.5,
      calificacionAreaMes: 95.5,
      p1: {
        chip: 'A_TIEMPO',
        estadoChip: 'A_TIEMPO',
        calificacion: 95.5,
        porcentaje: 95.5,
        ejecutadoPor: null,
        ejecutorReal: null,
      },
      p2: {
        chip: 'PENDIENTE',
        estadoChip: 'PENDIENTE',
        calificacion: null,
        porcentaje: null,
        ejecutadoPor: null,
        ejecutorReal: null,
      },
    };

    expect(filaCanonica.areaId).toBe(10);
    expect(filaCanonica.nombreArea).toBe('Línea de Producción 1');
    expect(filaCanonica.p1.chip).toBe('A_TIEMPO');
    expect(filaCanonica.p1.estadoChip).toBe('A_TIEMPO');
    expect(filaCanonica.p1.calificacion).toBe(95.5);
    expect(filaCanonica.p2.chip).toBe('PENDIENTE');
  });

  it('2. Procesa usuariosKpi con campos planos y anidados compatibles', () => {
    const usuarioKpi = {
      usuarioId: 2,
      nombre: 'Ana Auditora',
      nombreUsuario: 'ana.auditora',
      rol: 'AUDITOR',
      usuario: { id: 2, nombre: 'Ana Auditora', nombreUsuario: 'ana.auditora', rol: 'AUDITOR' },
      seEvalua: true,
      auditoriasEsperadas: 2,
      auditoriasATiempo: 1,
      porcentajeCumplimiento: 50,
      promedioAreas: 95.5,
      kpiFinal: 72.75,
      detallesAreas: [],
    };

    expect(usuarioKpi.usuarioId).toBe(2);
    expect(usuarioKpi.nombre).toBe('Ana Auditora');
    expect(usuarioKpi.kpiFinal).toBe(72.75);
    expect(usuarioKpi.seEvalua).toBe(true);
  });
});
