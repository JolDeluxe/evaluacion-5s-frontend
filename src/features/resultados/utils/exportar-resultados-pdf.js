import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCalificacionSemaforo } from '@/utils/calificacion-semaforo';
import { mapAreasConPosicion } from '@/features/resultados/utils/posicion-areas';
import { formatPercentTrunc } from '@/utils/format';

function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '';
  return formatPercentTrunc(val);
}

function getSanitizedFilename(rangoData, mesData) {
  const tipo = rangoData?.tipo || 'mes';
  if (tipo === 'trimestre') {
    return `resultados-5s-trimestre-${rangoData.trimestre}-${rangoData.anio}.pdf`;
  }
  if (tipo === 'semestre') {
    return `resultados-5s-semestre-${rangoData.semestre}-${rangoData.anio}.pdf`;
  }
  if (tipo === 'anio') {
    return `resultados-5s-año-${rangoData.anio}.pdf`;
  }
  const mesKey = mesData?.clave || 'periodo';
  return `resultados-5s-${mesKey}.pdf`;
}

async function cargarLogoBase64() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        ratio: img.naturalWidth / (img.naturalHeight || 1),
      });
    };
    img.onerror = () => resolve(null);
    img.src = '/img/01_Cuadra.png';
  });
}

function dibujarGaugeSemicircular(doc, x, y, radius, score, semaforoColor) {
  const kappa = 0.5522847498;
  doc.setLineWidth(2.5);
  doc.setDrawColor(226, 232, 240); // slate-200
  
  const cx = x;
  const cy = y;
  const r = radius;

  doc.path([
    { op: 'm', c: [cx - r, cy] },
    { op: 'c', c: [cx - r, cy - r * kappa, cx - r * kappa, cy - r, cx, cy - r] },
    { op: 'c', c: [cx + r * kappa, cy - r, cx + r, cy - r * kappa, cx + r, cy] },
  ]);
  doc.stroke();

  if (score !== null && score !== undefined && score >= 0) {
    const ratio = Math.min(Math.max(score, 0), 100) / 100;
    const [red, green, blue] = semaforoColor?.rgb || [34, 197, 94];
    doc.setLineWidth(3);
    doc.setDrawColor(red, green, blue);

    if (ratio >= 0.999) {
      doc.path([
        { op: 'm', c: [cx - r, cy] },
        { op: 'c', c: [cx - r, cy - r * kappa, cx - r * kappa, cy - r, cx, cy - r] },
        { op: 'c', c: [cx + r * kappa, cy - r, cx + r, cy - r * kappa, cx + r, cy] },
      ]);
      doc.stroke();
    } else if (ratio > 0) {
      const startAngle = Math.PI;
      const endAngle = Math.PI - (ratio * Math.PI);
      const steps = 30;
      const points = [];
      
      for (let i = 0; i <= steps; i += 1) {
        const angle = startAngle - (i / steps) * (startAngle - endAngle);
        const px = cx + r * Math.cos(angle);
        const py = cy - r * Math.sin(angle);
        if (i === 0) {
          points.push({ op: 'm', c: [px, py] });
        } else {
          points.push({ op: 'l', c: [px, py] });
        }
      }
      doc.path(points);
      doc.stroke();
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const scoreTxt = score !== null && score !== undefined ? `${formatPercentTrunc(score)}` : '—';
  doc.text(scoreTxt, x, y - 1, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('RESULTADO GENERAL', x, y + 3.5, { align: 'center' });
}

export async function exportarResultadosGeneralPdf(data) {
  if (!data) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm
  const margin = 7; // Margen 7mm

  // 1. CARGAR LOGO CUADRA CON ASPECT RATIO REAL
  const logoInfo = await cargarLogoBase64();
  if (logoInfo?.dataUrl) {
    const logoHeight = 6.5; // 6.5mm de alto
    const logoWidth = logoHeight * (logoInfo.ratio || 3.5);
    doc.addImage(logoInfo.dataUrl, 'PNG', margin, margin, logoWidth, logoHeight);
  }

  // 2. HEADER COMPACTO
  const tipoRango = data?.rango?.tipo || 'mes';
  const tituloHeader = (data?.rango?.etiqueta || data?.mes?.etiqueta || 'RESULTADOS 5S').toUpperCase();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('RESULTADOS 5S', margin + 30, margin + 4.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 83, 9); // amber-700 / marca acento
  doc.text(tituloHeader, margin + 70, margin + 4.8);

  // Línea divisora superior
  const headerY = margin + 8.5;
  doc.setLineWidth(0.25);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, headerY, pageWidth - margin, headerY);

  // 3. LAYOUT ANCHOS (74% Tabla, 24% Panel Lateral)
  const contentY = headerY + 3;
  const tableWidth = (pageWidth - (margin * 2)) * 0.74; // ~210mm
  const panelX = margin + tableWidth + 5; // ~222mm
  const panelWidth = pageWidth - margin - panelX; // ~68mm

  // 4. PANEL DERECHO COMPACTO
  const estadoGeneral = data?.estadoRango ?? data?.estadoMes ?? {};
  const resultadoGeneral = data?.resultadoGeneral;
  const mostrarResultado = Boolean(estadoGeneral.mostrarResultado && resultadoGeneral !== null && resultadoGeneral !== undefined);
  const semaforoGeneral = getCalificacionSemaforo(resultadoGeneral);

  // Card Resultado General
  let currentPanelY = contentY;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(panelX, currentPanelY, panelWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('RESULTADO GENERAL', panelX + 3.5, currentPanelY + 5);

  if (mostrarResultado && semaforoGeneral) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(semaforoGeneral.textColor);
    doc.text(formatPercentTrunc(resultadoGeneral), panelX + 3.5, currentPanelY + 14);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(148, 163, 184);
    doc.text('—', panelX + 3.5, currentPanelY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(estadoGeneral.etiqueta || 'EN CURSO', panelX + panelWidth - 3.5, currentPanelY + 13, { align: 'right' });
  }

  // Card Ganadores
  currentPanelY += 21;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(panelX, currentPanelY, panelWidth, 48, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const titulosGanadores = {
    mes: 'GANADORES DEL MES',
    trimestre: 'GANADORES DEL TRIMESTRE',
    semestre: 'GANADORES DEL SEMESTRE',
    anio: 'GANADORES DEL AÑO',
  };
  doc.text(titulosGanadores[tipoRango] || 'GANADORES DEL PERIODO', panelX + 3.5, currentPanelY + 5.5);

  const ganadoresPorTipo = data?.ganadoresPorTipo || {};
  const adminBlock = ganadoresPorTipo?.administrativo;
  const operBlock = ganadoresPorTipo?.operativo;

  let gY = currentPanelY + 11;

  // Ganador Administrativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('ADMINISTRATIVO', panelX + 3.5, gY);
  gY += 3.2;

  if (mostrarResultado && adminBlock?.areas?.length) {
    adminBlock.areas.forEach((area) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(area.nombre.slice(0, 28), panelX + 3.5, gY);

      doc.setTextColor(21, 128, 61); // verde
      doc.text(formatPercentTrunc(adminBlock.resultado), panelX + panelWidth - 3.5, gY, { align: 'right' });
      gY += 4;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(mostrarResultado ? 'Sin ganadores elegibles' : 'Se definirán al cierre del periodo', panelX + 3.5, gY);
    gY += 5;
  }

  gY += 2;
  // Ganador Operativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('OPERATIVO', panelX + 3.5, gY);
  gY += 3.2;

  if (mostrarResultado && operBlock?.areas?.length) {
    operBlock.areas.forEach((area) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(area.nombre.slice(0, 28), panelX + 3.5, gY);

      doc.setTextColor(21, 128, 61);
      doc.text(formatPercentTrunc(operBlock.resultado), panelX + panelWidth - 3.5, gY, { align: 'right' });
      gY += 4;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(mostrarResultado ? 'Sin ganadores elegibles' : 'Se definirán al cierre del periodo', panelX + 3.5, gY);
  }

  // Gauge semicircular
  currentPanelY += 53;
  const gaugeCenterX = panelX + (panelWidth / 2);
  const gaugeCenterY = currentPanelY + 22;
  dibujarGaugeSemicircular(
    doc,
    gaugeCenterX,
    gaugeCenterY,
    15,
    mostrarResultado ? resultadoGeneral : null,
    semaforoGeneral || { rgb: [34, 197, 94] }
  );

  // 5. CONSTRUCCIÓN DE LA TABLA (Celdas sin porcentaje quedan VACÍAS)
  const areas = mapAreasConPosicion(data?.areas || []);
  const totalAreas = areas.length;

  let headColumns = ['#', 'ÁREA'];
  if (tipoRango === 'trimestre') {
    const meses = data?.rango?.meses || [];
    meses.forEach((m) => headColumns.push(m.etiqueta.split(' ')[0].toUpperCase()));
    headColumns.push('RESULTADO');
  } else if (tipoRango === 'semestre') {
    const meses = data?.rango?.meses || [];
    meses.forEach((m) => headColumns.push(m.etiqueta.substring(0, 3).toUpperCase()));
    headColumns.push('RESULTADO');
  } else if (tipoRango === 'anio') {
    headColumns = ['#', 'ÁREA', 'T1', 'T2', 'T3', 'T4', 'RESULTADO ANUAL'];
  } else {
    headColumns = ['#', 'ÁREA', 'PERIODO 1', 'PERIODO 2', 'RESULTADO FINAL'];
  }

  const tableBody = areas.map((item) => {
    const row = [
      item.posicion !== null && item.posicion !== undefined ? String(item.posicion) : '',
      item.area.nombre,
    ];

    if (tipoRango === 'trimestre' || tipoRango === 'semestre') {
      const mesesDetalle = item.mesesDetalle || [];
      mesesDetalle.forEach((m) => {
        row.push(formatNumber(m.resultadoMensual));
      });
      row.push(formatNumber(item.resultadoRango ?? item.resultadoMensual));
    } else if (tipoRango === 'anio') {
      const trimestresDetalle = item.trimestresDetalle || [];
      trimestresDetalle.forEach((t) => {
        row.push(formatNumber(t.resultado));
      });
      row.push(formatNumber(item.resultadoRango ?? item.resultadoMensual));
    } else {
      (item.periodos || []).forEach((p) => {
        if (p.porcentaje !== null && p.porcentaje !== undefined && p.porcentaje !== '') {
          row.push(formatPercentTrunc(p.porcentaje));
        } else {
          row.push('');
        }
      });
      row.push(formatNumber(item.resultadoMensual));
    }

    return row;
  });

  // CÁLCULO DE ALTURA 100% SEGURO PARA ENTRAR EN 1 SOLA HOJA
  // Ubicación del footer y límite inferior de seguridad
  const footerY = 205; // 205mm
  const maxTableBottom = 202; // Límite estricto de la última fila
  const availableTableHeight = maxTableBottom - contentY; // 202 - 18.5 = 183.5mm

  const headerHeight = 6; // Fila de encabezado
  const availableRowsHeight = availableTableHeight - headerHeight;

  // Calculamos la altura real por fila dividiendo exactamente entre (totalAreas)
  // sumando un margen de seguridad del 8% para filas con posibles wraps (nombres largos)
  const countForCalculation = totalAreas <= 31 ? totalAreas + 1.5 : totalAreas;
  const rawRowHeight = availableRowsHeight / countForCalculation;
  const targetRowHeight = Math.min(Math.max(rawRowHeight, 3.8), 5.6);

  let fontSize = 6.4;
  let cellPaddingTopBottom = 0.5;

  if (totalAreas <= 31) {
    fontSize = 6.4;
    cellPaddingTopBottom = Math.max((targetRowHeight - 4.2) / 2, 0.4);
  } else {
    fontSize = 5.5;
    cellPaddingTopBottom = 0.3;
  }

  // Anchos optimizados de columna para asegurar que ÁREA tenga el 54% del espacio
  // # -> 4%, ÁREA -> 54%, P1 -> 13%, P2 -> 13%, RESULTADO -> 16%
  const columnStylesOpt = {
    0: { halign: 'center', cellWidth: tableWidth * 0.04 },
    1: { halign: 'left', cellWidth: tableWidth * 0.54, fontStyle: 'bold' },
  };

  if (tipoRango === 'mes') {
    columnStylesOpt[2] = { halign: 'center', cellWidth: tableWidth * 0.13 };
    columnStylesOpt[3] = { halign: 'center', cellWidth: tableWidth * 0.13 };
    columnStylesOpt[4] = { halign: 'center', cellWidth: tableWidth * 0.16 };
  }

  autoTable(doc, {
    startY: contentY,
    margin: { left: margin, bottom: pageHeight - maxTableBottom },
    tableWidth,
    head: [headColumns],
    body: tableBody,
    theme: 'grid',
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    styles: {
      font: 'helvetica',
      fontSize,
      cellPadding: { top: cellPaddingTopBottom, bottom: cellPaddingTopBottom, left: 1, right: 1 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      halign: 'center',
      minCellHeight: headerHeight,
    },
    columnStyles: columnStylesOpt,
    didParseCell: (cellData) => {
      if (cellData.section === 'body' && cellData.column.index === headColumns.length - 1) {
        const valStr = cellData.cell.raw;
        if (valStr && valStr !== '') {
          const numVal = parseFloat(valStr.replace('%', ''));
          if (!isNaN(numVal)) {
            const semaforo = getCalificacionSemaforo(numVal);
            if (semaforo) {
              const [r, g, b] = semaforo.rgb;
              cellData.cell.styles.fillColor = [r, g, b];
              cellData.cell.styles.textColor = [255, 255, 255];
              cellData.cell.styles.fontStyle = 'bold';
              cellData.cell.styles.halign = 'center';
            }
          } else {
            cellData.cell.styles.halign = 'center';
          }
        } else {
          cellData.cell.styles.halign = 'center';
        }
      } else if (cellData.section === 'body' && cellData.column.index >= 2) {
        cellData.cell.styles.halign = 'center';
      }
    },
  });

  // 6. FOOTER EN LA MISMA PÁGINA (Y = 205mm)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);

  const fechaGeneracion = new Date().toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.text('Manufacturera de Botas Cuadra · Sistema de Auditorías 5S', margin, footerY);
  doc.text(`Generado el ${fechaGeneracion}`, pageWidth - margin, footerY, { align: 'right' });

  // 7. DESCARGA AUTOMÁTICA
  const filename = getSanitizedFilename(data?.rango, data?.mes);
  doc.save(filename);
}
