import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoUrl from '@/assets/lacer-logo-color.png';
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

const LACER_RED = 'FFE31937';
const LACER_RED_DARK = 'FFB31329';
const HEADER_TEXT = 'FFFFFFFF';
const ZEBRA = 'FFFAFAFA';
const SOFT_BORDER = 'FFE5E7EB';
const TITLE_DARK = 'FF111827';
const SUBTLE_TEXT = 'FF6B7280';

const fileStamp = (range: RangeBounds) => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `lacer-dashboard-${range.preset}-${d}`;
};

const thinBorder: ExcelJS.Borders = {
  top: { style: 'thin', color: { argb: SOFT_BORDER } },
  left: { style: 'thin', color: { argb: SOFT_BORDER } },
  bottom: { style: 'thin', color: { argb: SOFT_BORDER } },
  right: { style: 'thin', color: { argb: SOFT_BORDER } },
} as ExcelJS.Borders;

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LACER_RED } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });
}

function applyZebra(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, colCount: number) {
  for (let r = startRow; r <= endRow; r++) {
    const isOdd = (r - startRow) % 2 === 1;
    for (let c = 1; c <= colCount; c++) {
      const cell = sheet.getCell(r, c);
      cell.font = { name: 'Calibri', size: 10, color: { argb: TITLE_DARK }, ...(cell.font || {}) };
      cell.alignment = { vertical: 'middle', ...(cell.alignment || {}) };
      cell.border = thinBorder;
      if (isOdd) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
      }
    }
  }
}

async function loadLogoBuffer(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(logoUrl);
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function addBranding(wb: ExcelJS.Workbook, sheet: ExcelJS.Worksheet, range: RangeBounds, subtitle: string) {
  // Reserve top brand band rows 1..4
  sheet.getRow(1).height = 18;
  sheet.getRow(2).height = 28;
  sheet.getRow(3).height = 18;
  sheet.getRow(4).height = 8;

  // Logo
  const buf = await loadLogoBuffer();
  if (buf) {
    const imgId = wb.addImage({ buffer: buf, extension: 'png' });
    sheet.addImage(imgId, {
      tl: { col: 0.15, row: 0.4 },
      ext: { width: 110, height: 44 },
    });
  }

  // Title
  sheet.mergeCells('B2:H2');
  const titleCell = sheet.getCell('B2');
  titleCell.value = 'Lacer · Talonario Digital';
  titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: LACER_RED } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  sheet.mergeCells('B3:H3');
  const subCell = sheet.getCell('B3');
  subCell.value = `${subtitle}  ·  ${range.label}  ·  Generado ${new Date().toLocaleString('es-ES')}`;
  subCell.font = { name: 'Calibri', size: 10, color: { argb: SUBTLE_TEXT } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Red separator line on row 4
  for (let c = 1; c <= 10; c++) {
    sheet.getCell(4, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LACER_RED } };
  }
  sheet.getRow(4).height = 4;
}

function formatNumber(cell: ExcelJS.Cell) {
  cell.numFmt = '#,##0;(#,##0);-';
}
function formatPercent(cell: ExcelJS.Cell) {
  cell.numFmt = '0.0%;(0.0%);-';
}

export async function exportToXlsx(data: DashboardExportData) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Lacer · Talonario Digital';
  wb.created = new Date();

  // ======= RESUMEN =======
  const wsR = wb.addWorksheet('Resumen', { views: [{ showGridLines: false }] });
  wsR.columns = [
    { width: 4 }, { width: 36 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 6 },
  ];
  await addBranding(wb, wsR, data.range, 'Resumen ejecutivo');

  // KPI cards row
  let row = 6;
  const kpis: [string, string | number, string?][] = [
    ['Recetas (rango)', data.kpis.period_count],
    ['Periodo anterior', data.kpis.previous_period_count],
    ['Variación', data.kpis.variation_pct !== null ? `${data.kpis.variation_pct > 0 ? '+' : ''}${data.kpis.variation_pct}%` : '—'],
    ['Recetas hoy', data.kpis.today_count],
    ['Tasa dispensación', `${data.kpis.dispensing_rate}%`],
    ['Productos/receta (media)', data.kpis.avg_products_per_recipe],
  ];
  // Two rows of 3 cards each
  const layout = [
    [{ c: 2 }, { c: 3 }, { c: 4 }],
    [{ c: 5 }, { c: 6 }, { c: 7 }],
  ];
  kpis.forEach((kpi, i) => {
    const rIdx = i < 3 ? row : row + 3;
    const cIdx = layout[0][i % 3].c;
    // Label
    const labelCell = wsR.getCell(rIdx, cIdx);
    labelCell.value = kpi[0];
    labelCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: SUBTLE_TEXT } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'left' };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    labelCell.border = { top: { style: 'medium', color: { argb: LACER_RED } }, left: thinBorder.left, right: thinBorder.right } as ExcelJS.Borders;
    // Value
    const valCell = wsR.getCell(rIdx + 1, cIdx);
    valCell.value = kpi[1];
    valCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: TITLE_DARK } };
    valCell.alignment = { vertical: 'middle', horizontal: 'left' };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    valCell.border = { left: thinBorder.left, right: thinBorder.right, bottom: thinBorder.bottom } as ExcelJS.Borders;
    wsR.getRow(rIdx).height = 18;
    wsR.getRow(rIdx + 1).height = 28;
  });

  // Global stats table
  row = 13;
  wsR.getCell(`B${row}`).value = 'Indicadores globales';
  wsR.getCell(`B${row}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: LACER_RED_DARK } };
  row += 1;
  const headerRow = wsR.getRow(row);
  headerRow.getCell(2).value = 'Indicador';
  headerRow.getCell(3).value = 'Valor';
  styleHeaderRow(headerRow);
  const globals = [
    ['Profesionales totales', data.kpis.total_users],
    ['Productos en catálogo', data.kpis.total_products],
    ['Total recetas histórico', data.kpis.total_recipes],
    ['Recetas dispensadas', data.kpis.dispensed_count],
  ];
  globals.forEach((g, i) => {
    const r = row + 1 + i;
    wsR.getCell(r, 2).value = g[0];
    wsR.getCell(r, 3).value = g[1];
    formatNumber(wsR.getCell(r, 3));
  });
  applyZebra(wsR, row + 1, row + globals.length, 3);

  // ======= TIMESERIES =======
  const wsTs = wb.addWorksheet('Recetas por periodo', { views: [{ showGridLines: false }] });
  wsTs.columns = [{ width: 4 }, { width: 28 }, { width: 16 }];
  await addBranding(wb, wsTs, data.range, 'Evolución temporal');
  row = 6;
  const tsHeader = wsTs.getRow(row);
  tsHeader.getCell(2).value = 'Periodo';
  tsHeader.getCell(3).value = 'Recetas';
  styleHeaderRow(tsHeader);
  data.timeseries.forEach((r, i) => {
    const rr = row + 1 + i;
    wsTs.getCell(rr, 2).value = new Date(r.period).toLocaleString('es-ES');
    wsTs.getCell(rr, 3).value = r.total;
    formatNumber(wsTs.getCell(rr, 3));
  });
  if (data.timeseries.length > 0) {
    const last = row + data.timeseries.length;
    applyZebra(wsTs, row + 1, last, 3);
    const totalRow = wsTs.getRow(last + 1);
    totalRow.getCell(2).value = 'Total';
    totalRow.getCell(3).value = { formula: `SUM(C${row + 1}:C${last})` } as any;
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: HEADER_TEXT } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LACER_RED_DARK } };
      cell.alignment = { vertical: 'middle', horizontal: cell.col === '2' ? 'left' : 'right' };
    });
    formatNumber(totalRow.getCell(3));
  }

  // ======= SEND METHODS =======
  const wsSm = wb.addWorksheet('Método de envío', { views: [{ showGridLines: false }] });
  wsSm.columns = [{ width: 4 }, { width: 24 }, { width: 12 }, { width: 10 }];
  await addBranding(wb, wsSm, data.range, 'Métodos de envío');
  row = 6;
  const totalSent = data.sendMethods.reduce((s, m) => s + m.value, 0);
  const smH = wsSm.getRow(row);
  smH.getCell(2).value = 'Método';
  smH.getCell(3).value = 'Total';
  smH.getCell(4).value = '%';
  styleHeaderRow(smH);
  data.sendMethods.forEach((m, i) => {
    const rr = row + 1 + i;
    wsSm.getCell(rr, 2).value = m.name;
    wsSm.getCell(rr, 3).value = m.value;
    wsSm.getCell(rr, 4).value = totalSent > 0 ? m.value / totalSent : 0;
    formatNumber(wsSm.getCell(rr, 3));
    formatPercent(wsSm.getCell(rr, 4));
  });
  if (data.sendMethods.length) applyZebra(wsSm, row + 1, row + data.sendMethods.length, 4);

  // ======= TOP PRODUCTS =======
  const wsTp = wb.addWorksheet('Top productos', { views: [{ showGridLines: false }] });
  wsTp.columns = [{ width: 4 }, { width: 6 }, { width: 44 }, { width: 18 }, { width: 16 }];
  await addBranding(wb, wsTp, data.range, 'Productos más prescritos');
  row = 6;
  const tpH = wsTp.getRow(row);
  tpH.getCell(2).value = '#';
  tpH.getCell(3).value = 'Producto';
  tpH.getCell(4).value = 'Referencia';
  tpH.getCell(5).value = 'Veces prescrito';
  styleHeaderRow(tpH);
  data.topProducts.forEach((p, i) => {
    const rr = row + 1 + i;
    wsTp.getCell(rr, 2).value = i + 1;
    wsTp.getCell(rr, 3).value = p.product_name;
    wsTp.getCell(rr, 4).value = p.reference ?? '—';
    wsTp.getCell(rr, 5).value = p.times_prescribed;
    formatNumber(wsTp.getCell(rr, 5));
    if (i < 3) {
      // Highlight top 3
      wsTp.getCell(rr, 2).font = { bold: true, color: { argb: LACER_RED } };
    }
  });
  if (data.topProducts.length) applyZebra(wsTp, row + 1, row + data.topProducts.length, 5);

  // ======= PROVINCES =======
  const wsProv = wb.addWorksheet('Provincias', { views: [{ showGridLines: false }] });
  wsProv.columns = [{ width: 4 }, { width: 26 }, { width: 16 }, { width: 14 }];
  await addBranding(wb, wsProv, data.range, 'Distribución geográfica');
  row = 6;
  const pH = wsProv.getRow(row);
  pH.getCell(2).value = 'Provincia';
  pH.getCell(3).value = 'Profesionales';
  pH.getCell(4).value = 'Recetas';
  styleHeaderRow(pH);
  data.provinces.forEach((p, i) => {
    const rr = row + 1 + i;
    wsProv.getCell(rr, 2).value = p.province;
    wsProv.getCell(rr, 3).value = p.professionals;
    wsProv.getCell(rr, 4).value = p.total_recipes;
    formatNumber(wsProv.getCell(rr, 3));
    formatNumber(wsProv.getCell(rr, 4));
  });
  if (data.provinces.length) applyZebra(wsProv, row + 1, row + data.provinces.length, 4);

  // ======= TOP PROFESSIONALS =======
  const wsPro = wb.addWorksheet('Top profesionales', { views: [{ showGridLines: false }] });
  wsPro.columns = [{ width: 4 }, { width: 6 }, { width: 30 }, { width: 28 }, { width: 18 }, { width: 18 }, { width: 12 }];
  await addBranding(wb, wsPro, data.range, 'Profesionales más activos');
  row = 6;
  const proH = wsPro.getRow(row);
  proH.getCell(2).value = '#';
  proH.getCell(3).value = 'Clínica';
  proH.getCell(4).value = 'Profesional';
  proH.getCell(5).value = 'Provincia';
  proH.getCell(6).value = 'Localidad';
  proH.getCell(7).value = 'Recetas';
  styleHeaderRow(proH);
  data.topProfessionals.forEach((p, i) => {
    const rr = row + 1 + i;
    wsPro.getCell(rr, 2).value = i + 1;
    wsPro.getCell(rr, 3).value = p.clinic_name ?? '—';
    wsPro.getCell(rr, 4).value = p.professional_name ?? '—';
    wsPro.getCell(rr, 5).value = p.province ?? '—';
    wsPro.getCell(rr, 6).value = p.locality ?? '—';
    wsPro.getCell(rr, 7).value = p.total_recipes;
    formatNumber(wsPro.getCell(rr, 7));
    if (i < 3) wsPro.getCell(rr, 2).font = { bold: true, color: { argb: LACER_RED } };
  });
  if (data.topProfessionals.length) applyZebra(wsPro, row + 1, row + data.topProfessionals.length, 7);

  // ======= HEATMAP =======
  const wsHm = wb.addWorksheet('Heatmap', { views: [{ showGridLines: false }] });
  const hmCols = [{ width: 4 }, { width: 10 }];
  for (let h = 0; h < 24; h++) hmCols.push({ width: 5 });
  wsHm.columns = hmCols;
  await addBranding(wb, wsHm, data.range, 'Actividad por día y hora');
  row = 6;
  const hmH = wsHm.getRow(row);
  hmH.getCell(2).value = 'Día / Hora';
  for (let h = 0; h < 24; h++) hmH.getCell(3 + h).value = `${h}h`;
  styleHeaderRow(hmH);
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  // Find max for color scaling
  const maxVal = Math.max(1, ...data.heatmap.map((x) => x.total));
  for (let d = 1; d <= 7; d++) {
    const rr = row + d;
    const labelCell = wsHm.getCell(rr, 2);
    labelCell.value = dayNames[d - 1];
    labelCell.font = { bold: true, color: { argb: TITLE_DARK } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCell.border = thinBorder;
    for (let h = 0; h < 24; h++) {
      const cell = wsHm.getCell(rr, 3 + h);
      const v = data.heatmap.find((x) => x.weekday === d && x.hour === h)?.total ?? 0;
      cell.value = v;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
      cell.font = { size: 9, color: { argb: v / maxVal > 0.5 ? 'FFFFFFFF' : TITLE_DARK } };
      // intensity: 0..1 -> red gradient
      const intensity = v / maxVal;
      if (v === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      } else {
        // Blend white -> Lacer red
        const r = Math.round(255 - (255 - 0xe3) * intensity);
        const g = Math.round(255 - (255 - 0x19) * intensity);
        const b = Math.round(255 - (255 - 0x37) * intensity);
        const hex = `FF${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hex } };
      }
    }
  }

  // ======= RECENT =======
  const wsRec = wb.addWorksheet('Recetas recientes', { views: [{ showGridLines: false }] });
  wsRec.columns = [{ width: 4 }, { width: 30 }, { width: 22 }, { width: 16 }, { width: 18 }, { width: 12 }];
  await addBranding(wb, wsRec, data.range, 'Últimas recetas');
  row = 6;
  const recH = wsRec.getRow(row);
  recH.getCell(2).value = 'Paciente';
  recH.getCell(3).value = 'Fecha';
  recH.getCell(4).value = 'Vía de envío';
  recH.getCell(5).value = 'Código';
  recH.getCell(6).value = 'Dispensada';
  styleHeaderRow(recH);
  data.recent.forEach((r, i) => {
    const rr = row + 1 + i;
    wsRec.getCell(rr, 2).value = r.patient_name;
    wsRec.getCell(rr, 3).value = new Date(r.created_at).toLocaleString('es-ES');
    wsRec.getCell(rr, 4).value = r.sent_via ?? '—';
    wsRec.getCell(rr, 5).value = r.recipe_code ?? '—';
    const disp = wsRec.getCell(rr, 6);
    disp.value = r.dispensed_at ? 'Sí' : 'No';
    disp.alignment = { horizontal: 'center', vertical: 'middle' };
    if (r.dispensed_at) {
      disp.font = { bold: true, color: { argb: 'FF15803D' } };
    } else {
      disp.font = { color: { argb: SUBTLE_TEXT } };
    }
  });
  if (data.recent.length) applyZebra(wsRec, row + 1, row + data.recent.length, 6);

  // Save
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileStamp(data.range)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
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

  // Brand band
  pdf.setFillColor(227, 25, 55);
  pdf.rect(0, 0, pageW, 8, 'F');

  // Logo
  try {
    const logoRes = await fetch(logoUrl);
    const logoBlob = await logoRes.blob();
    const logoData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });
    pdf.addImage(logoData, 'PNG', 10, 12, 28, 11);
  } catch {}

  pdf.setFontSize(14);
  pdf.setTextColor(227, 25, 55);
  pdf.text('Lacer · Talonario Digital — Dashboard', 44, 18);
  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(`Rango: ${range.label}  ·  Generado: ${new Date().toLocaleString('es-ES')}`, 44, 24);

  const imgData = canvas.toDataURL('image/png');
  const imgW = pageW - 20;
  const imgH = (canvas.height * imgW) / canvas.width;
  let y = 30;
  let remaining = imgH;
  let sourceY = 0;
  const availH = pageH - y - 8;

  if (imgH <= availH) {
    pdf.addImage(imgData, 'PNG', 10, y, imgW, imgH);
  } else {
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
        pdf.setFillColor(227, 25, 55);
        pdf.rect(0, 0, pageW, 8, 'F');
        y = 12;
      }
    }
  }

  pdf.save(`${fileStamp(range)}.pdf`);
}
