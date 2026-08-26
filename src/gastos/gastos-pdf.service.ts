import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { GastosService } from './gastos.service';

type ReporteGastos = Awaited<ReturnType<GastosService['listar']>>;

const TERRACOTA = '#b5674d';
const CAFE = '#4a3f33';
const CREMA = '#faf7f2';
const GRIS = '#8a7d6f';
const BORDE = '#e4d8c2';

const METODO_CORTO: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transf.',
  YAPE: 'Yape',
  PLIN: 'Plin',
};

const soles = (v: unknown) =>
  `S/ ${Number(v).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fechaCorta = (d: Date) =>
  d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

@Injectable()
export class GastosPdfService {
  generar(reporte: ReporteGastos): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: { Title: 'Reporte de gastos — Qunuq Alpaca', Author: 'Qunuq Alpaca' },
    });

    const X = 50;
    const ANCHO = 495;

    // ── Cabecera ──
    doc.font('Helvetica-Bold').fontSize(20).fillColor(TERRACOTA);
    doc.text('Qunuq Alpaca', X, 50);
    doc.font('Helvetica').fontSize(9).fillColor(GRIS);
    doc.text('Tejidos de alpaca personalizados', X, 74);
    doc.moveTo(X, 96).lineTo(X + ANCHO, 96).lineWidth(1.5).strokeColor(TERRACOTA).stroke();

    doc.font('Helvetica-Bold').fontSize(14).fillColor(CAFE);
    doc.text('REPORTE DE GASTOS', X, 110);

    const { desde, hasta } = reporte.filtros;
    const periodo =
      desde || hasta
        ? `Periodo: ${desde ? fechaCorta(new Date(`${desde}T12:00:00`)) : 'inicio'} — ${hasta ? fechaCorta(new Date(`${hasta}T12:00:00`)) : 'hoy'}`
        : 'Periodo: todos los gastos registrados';
    doc.font('Helvetica').fontSize(9).fillColor(GRIS);
    doc.text(`${periodo}   ·   Generado el ${fechaCorta(new Date())}`, X, 130);

    // ── Resumen ──
    let y = 152;
    doc.roundedRect(X, y, ANCHO, 40, 6).fillColor(CREMA).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GRIS);
    doc.text('TOTAL GASTADO', X + 14, y + 8);
    doc.text('N° DE GASTOS', X + 170, y + 8);
    doc.text('FIJOS (PASIVOS)', X + 280, y + 8);
    doc.text('VARIABLES (ACTIVOS)', X + 385, y + 8);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(TERRACOTA);
    doc.text(soles(reporte.total), X + 14, y + 19);
    doc.fillColor(CAFE);
    doc.text(String(reporte.cantidad), X + 170, y + 19);
    doc.fontSize(11);
    doc.text(soles(reporte.porTipo.FIJO ?? 0), X + 280, y + 20);
    doc.text(soles(reporte.porTipo.VARIABLE ?? 0), X + 385, y + 20);

    // ── Tabla ──
    const col = {
      fecha: { x: X + 10, w: 55 },
      categoria: { x: X + 70, w: 80 },
      descripcion: { x: X + 155, w: 155 },
      tipo: { x: X + 315, w: 48 },
      metodo: { x: X + 368, w: 48 },
      monto: { x: X + 420, w: 65 },
    };

    y = 212;
    const cabecera = () => {
      doc.rect(X, y, ANCHO, 20).fillColor(CAFE).fill();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
      doc.text('FECHA', col.fecha.x, y + 6, { width: col.fecha.w });
      doc.text('CATEGORÍA', col.categoria.x, y + 6, { width: col.categoria.w });
      doc.text('DESCRIPCIÓN', col.descripcion.x, y + 6, { width: col.descripcion.w });
      doc.text('TIPO', col.tipo.x, y + 6, { width: col.tipo.w });
      doc.text('MÉTODO', col.metodo.x, y + 6, { width: col.metodo.w });
      doc.text('MONTO', col.monto.x, y + 6, { width: col.monto.w, align: 'right' });
      y += 20;
    };
    cabecera();

    doc.font('Helvetica').fontSize(8.5);
    reporte.gastos.forEach((g, idx) => {
      const texto = g.proveedor ? `${g.descripcion} · ${g.proveedor}` : g.descripcion;
      const hDesc = doc.heightOfString(texto, { width: col.descripcion.w });
      const hCat = doc.heightOfString(g.categoria, { width: col.categoria.w });
      const alto = Math.max(hDesc, hCat, 10) + 8;

      if (y + alto > 720) {
        doc.addPage();
        y = 60;
        cabecera();
        doc.font('Helvetica').fontSize(8.5);
      }

      if (idx % 2 === 1) doc.rect(X, y, ANCHO, alto).fillColor(CREMA).fill();
      doc.fillColor(GRIS);
      doc.text(fechaCorta(new Date(g.fecha)), col.fecha.x, y + 4, { width: col.fecha.w });
      doc.fillColor(CAFE);
      doc.text(g.categoria, col.categoria.x, y + 4, { width: col.categoria.w });
      doc.fillColor(GRIS);
      doc.text(texto, col.descripcion.x, y + 4, { width: col.descripcion.w });
      doc.text(g.tipo === 'FIJO' ? 'Fijo' : 'Variable', col.tipo.x, y + 4, { width: col.tipo.w });
      doc.text(METODO_CORTO[g.metodo] ?? g.metodo, col.metodo.x, y + 4, { width: col.metodo.w });
      doc.fillColor(CAFE);
      doc.text(soles(g.monto), col.monto.x, y + 4, { width: col.monto.w, align: 'right' });
      y += alto;
    });

    if (reporte.gastos.length === 0) {
      doc.fillColor(GRIS).fontSize(9);
      doc.text('No hay gastos en el periodo seleccionado.', X, y + 10, {
        width: ANCHO,
        align: 'center',
      });
      y += 30;
    }

    doc.moveTo(X, y).lineTo(X + ANCHO, y).lineWidth(0.5).strokeColor(BORDE).stroke();

    // ── Total por categoría ──
    if (reporte.porCategoria.length > 0) {
      y += 14;
      if (y > 660) {
        doc.addPage();
        y = 60;
      }
      doc.font('Helvetica-Bold').fontSize(10).fillColor(CAFE);
      doc.text('Total por categoría', X, y);
      y += 16;
      doc.fontSize(9);
      for (const c of reporte.porCategoria) {
        if (y > 730) {
          doc.addPage();
          y = 60;
        }
        doc.font('Helvetica').fillColor(CAFE);
        doc.text(c.categoria, X + 10, y, { width: 300 });
        doc.font('Helvetica-Bold');
        doc.text(soles(c.monto), X + 355, y, { width: 130, align: 'right' });
        y += 15;
      }
      y += 2;
      doc.moveTo(X + 300, y).lineTo(X + ANCHO, y).lineWidth(0.75).strokeColor(BORDE).stroke();
      y += 8;
      doc.font('Helvetica-Bold').fontSize(11).fillColor(TERRACOTA);
      doc.text('TOTAL', X + 10, y);
      doc.text(soles(reporte.total), X + 355, y, { width: 130, align: 'right' });
    }

    doc.font('Helvetica').fontSize(8).fillColor(GRIS);
    doc.text('Documento interno — Qunuq Alpaca', X, 775, { width: ANCHO, align: 'center' });

    return doc;
  }
}
