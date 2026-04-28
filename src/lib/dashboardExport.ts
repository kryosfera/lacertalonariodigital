import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { RangeBounds } from './dateRanges';

export interface DashboardExportData {
  range: RangeBounds;
  kpis: {
    total_recipes: number;
    today_count: number;
    period_count: number;
    previous_period_count: number;
    avg_products_per_recipe: number;
    dispensed_count: number;
    dispensing_rate: number;
    variation_pct: number | null;
    total_users: number;
    total_products: number;
  };
  timeseries: { period: string; total: number }[];
  sendMethods: { name: string; value: number }[];
  topProducts: { product_name: string; reference: string | null; times_prescribed: number }[];
  provinces: { province: string; professionals: number; total_recipes: number }[];
  topProfessionals: {
    clinic_name: string | null;
    professional_name: string | null;
    province: string | null;
    locality: string | null;
    total_recipes: number;
  }[];
  heatmap: { weekday: number; hour: number; total: number }[];
  recent: { patient_name: string; created_at: string; sent_via: string | null; recipe_code: string | null; dispensed_at: string | null }[];
}

const fileStamp = (range: RangeBounds) => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `lacer-dashboard-${range.preset}-${d}`;
};

export function exportToXlsx(data: DashboardExportData) {
  const wb = XLSX.utils.book_new();

  // Resumen
  const resumenRows = [
    ['Lacer · Talonario Digital — Dashboard'],
    ['Rango aplicado', data.range.label],
    ['Desde', data.range.start.toLocaleString('es-ES')],
    ['Hasta', data.range.end.toLocaleString('es-ES')],
    ['Generado', new Date().toLocaleString('es-ES')],
    [],
    ['KPI', 'Valor'],
    ['Total recetas (rango)', data.kpis.period_count],
    ['Periodo anterior equivalente', data.kpis.previous_period_count],
    ['Variación %', data.kpis.variation_pct !== null ? `${data.kpis.variation_pct}%` : '—'],
    ['Recetas hoy', data.kpis.today_count],
    ['Productos por receta (media)', data.kpis.avg_products_per_recipe],
    ['Recetas dispensadas', data.kpis.dispensed_count],
    ['Tasa de dispensación', `${data.kpis.dispensing_rate}%`],
    ['Profesionales totales (global)', data.kpis.total_users],
    ['Productos en catálogo (global)', data.kpis.total_products],
    ['Total recetas histórico (global)', data.kpis.total_recipes],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  wsResumen['!cols'] = [{ wch: 38 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Timeseries
  const tsRows = [['Periodo', 'Recetas'], ...data.timeseries.map((r) => [new Date(r.period).toLocaleString('es-ES'), r.total])];
  const wsTs = XLSX.utils.aoa_to_sheet(tsRows);
  wsTs['!cols'] = [{ wch: 24 }, { wch: 12 }];
  if (data.timeseries.length > 0) {
    const sumRow = data.timeseries.length + 2;
    XLSX.utils.sheet_add_aoa(wsTs, [['Total', { f: `SUM(B2:B${sumRow - 1})` }]], { origin: `A${sumRow}` });
  }
  XLSX.utils.book_append_sheet(wb, wsTs, 'Recetas por periodo');

  // Send methods
  const totalSent = data.sendMethods.reduce((s, m) => s + m.value, 0);
  const smRows = [
    ['Método', 'Total', '%'],
    ...data.sendMethods.map((m) => [m.name, m.value, totalSent > 0 ? `${Math.round((m.value / totalSent) * 100)}%` : '0%']),
  ];
  const wsSm = XLSX.utils.aoa_to_sheet(smRows);
  wsSm['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, wsSm, 'Método de envío');

  // Top products
  const tpRows = [
    ['#', 'Producto', 'Referencia', 'Veces prescrito'],
    ...data.topProducts.map((p, i) => [i + 1, p.product_name, p.reference ?? '—', p.times_prescribed]),
  ];
  const wsTp = XLSX.utils.aoa_to_sheet(tpRows);
  wsTp['!cols'] = [{ wch: 4 }, { wch: 40 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsTp, 'Top productos');

  // Provinces
  const provRows = [
    ['Provincia', 'Profesionales', 'Recetas'],
    ...data.provinces.map((p) => [p.province, p.professionals, p.total_recipes]),
  ];
  const wsProv = XLSX.utils.aoa_to_sheet(provRows);
  wsProv['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsProv, 'Provincias');

  // Top professionals
  const proRows = [
    ['#', 'Clínica', 'Profesional', 'Provincia', 'Localidad', 'Recetas'],
    ...data.topProfessionals.map((p, i) => [
      i + 1,
      p.clinic_name ?? '—',
      p.professional_name ?? '—',
      p.province ?? '—',
      p.locality ?? '—',
      p.total_recipes,
    ]),
  ];
  const wsPro = XLSX.utils.aoa_to_sheet(proRows);
  wsPro['!cols'] = [{ wch: 4 }, { wch: 28 }, { wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsPro, 'Top profesionales');

  // Heatmap
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hmRows: (string | number)[][] = [['Día \\ Hora', ...Array.from({ length: 24 }, (_, h) => `${h}h`)]];
  for (let d = 1; d <= 7; d++) {
    const row: (string | number)[] = [dayNames[d - 1]];
    for (let h = 0; h < 24; h++) {
      const cell = data.heatmap.find((x) => x.weekday === d && x.hour === h);
      row.push(cell?.total ?? 0);
    }
    hmRows.push(row);
  }
  const wsHm = XLSX.utils.aoa_to_sheet(hmRows);
  XLSX.utils.book_append_sheet(wb, wsHm, 'Heatmap');

  // Recent
  const recRows = [
    ['Paciente', 'Fecha', 'Vía de envío', 'Código', 'Dispensada'],
    ...data.recent.map((r) => [
      r.patient_name,
      new Date(r.created_at).toLocaleString('es-ES'),
      r.sent_via ?? '—',
      r.recipe_code ?? '—',
      r.dispensed_at ? 'Sí' : 'No',
    ]),
  ];
  const wsRec = XLSX.utils.aoa_to_sheet(recRows);
  wsRec['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsRec, 'Recetas recientes');

  XLSX.writeFile(wb, `${fileStamp(data.range)}.xlsx`);
}

export function exportToCsv(data: DashboardExportData) {
  const rows = [
    ['Lacer · Dashboard'],
    ['Rango', data.range.label],
    [],
    ['Periodo', 'Recetas'],
    ...data.timeseries.map((r) => [new Date(r.period).toISOString(), String(r.total)]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileStamp(data.range)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToPdf(elementId: string, range: RangeBounds) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error('Elemento no encontrado');

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: el.scrollWidth,
  });

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Header
  pdf.setFontSize(14);
  pdf.setTextColor(227, 25, 55);
  pdf.text('Lacer · Talonario Digital — Dashboard', 12, 12);
  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(`Rango: ${range.label}  ·  Generado: ${new Date().toLocaleString('es-ES')}`, 12, 18);

  const imgData = canvas.toDataURL('image/png');
  const imgW = pageW - 20;
  const imgH = (canvas.height * imgW) / canvas.width;
  let y = 24;
  let remaining = imgH;
  let sourceY = 0;
  const availH = pageH - y - 8;

  if (imgH <= availH) {
    pdf.addImage(imgData, 'PNG', 10, y, imgW, imgH);
  } else {
    // Slice across pages
    const pageCanvas = document.createElement('canvas');
    const ctx = pageCanvas.getContext('2d')!;
    const sliceHpx = (availH * canvas.width) / imgW;
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHpx;
    while (remaining > 0) {
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHpx, 0, 0, canvas.width, sliceHpx);
      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 10, y, imgW, Math.min(availH, remaining));
      remaining -= availH;
      sourceY += sliceHpx;
      if (remaining > 0) {
        pdf.addPage();
        y = 12;
      }
    }
  }

  pdf.save(`${fileStamp(range)}.pdf`);
}
