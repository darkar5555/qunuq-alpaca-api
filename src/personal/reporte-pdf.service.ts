import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PersonalService } from './personal.service';

type Reporte = Awaited<ReturnType<PersonalService['reporte']>>;

const TERRACOTA = '#b5674d';
const CAFE = '#4a3f33';
const CREMA = '#faf7f2';
const GRIS = '#8a7d6f';
const BORDE = '#e4d8c2';

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin',
};

// Versión corta para la columna de la tabla (espacio angosto).
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
export class ReportePdfService {
  generar(reporte: Reporte): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: { Title: 'Reporte de pagos al personal — Qunuq Alpaca', Author: 'Qunuq Alpaca' },
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
    doc.text('REPORTE DE PAGOS AL PERSONAL', X, 110);

    const { desde, hasta } = reporte.filtros;
    const periodo =
      desde || hasta
        ? `Periodo: ${desde ? fechaCorta(new Date(`${desde}T12:00:00`)) : 'inicio'} — ${hasta ? fechaCorta(new Date(`${hasta}T12:00:00`)) : 'hoy'}`
        : 'Periodo: todos los pagos registrados';
    doc.font('Helvetica').fontSize(9).fillColor(GRIS);
    doc.text(`${periodo}   ·   Generado el ${fechaCorta(new Date())}`, X, 130);

    // ── Resumen ──
    let y = 152;
    doc.roundedRect(X, y, ANCHO, 40, 6).fillColor(CREMA).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GRIS);
    doc.text('TOTAL PAGADO', X + 14, y + 8);
    doc.text('N° DE PAGOS', X + 170, y + 8);
    doc.text('POR MÉTODO', X + 280, y + 8);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(TERRACOTA);
    doc.text(soles(reporte.total), X + 14, y + 19);
    doc.fillColor(CAFE);
    doc.text(String(reporte.cantidad), X + 170, y + 19);
    doc.font('Helvetica').fontSize(8.5).fillColor(CAFE);
    const metodos = Object.entries(reporte.porMetodo)
      .map(([m, v]) => `${METODO_LABEL[m] ?? m}: ${soles(v)}`)
      .join('   ');
    doc.text(metodos || '—', X + 280, y + 21, { width: ANCHO - 290 });

    // ── Tabla de pagos ──
    const col = {
      fecha: { x: X + 10, w: 55 },
      trabajador: { x: X + 70, w: 115 },
      concepto: { x: X + 190, w: 140 },
      pedido: { x: X + 335, w: 55 },
      metodo: { x: X + 393, w: 42 },
      monto: { x: X + 438, w: 47 },
    };

    y = 212;
    const cabecera = () => {
      doc.rect(X, y, ANCHO, 20).fillColor(CAFE).fill();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
      doc.text('FECHA', col.fecha.x, y + 6, { width: col.fecha.w });
      doc.text('TRABAJADOR', col.trabajador.x, y + 6, { width: col.trabajador.w });
      doc.text('CONCEPTO', col.concepto.x, y + 6, { width: col.concepto.w });
      doc.text('PEDIDO', col.pedido.x, y + 6, { width: col.pedido.w });
      doc.text('MÉTODO', col.metodo.x, y + 6, { width: col.metodo.w });
      doc.text('MONTO', col.monto.x, y + 6, { width: col.monto.w, align: 'right' });
      y += 20;
    };
    cabecera();

    doc.font('Helvetica').fontSize(8.5);
    reporte.pagos.forEach((p, idx) => {
      const hCon = doc.heightOfString(p.concepto, { width: col.concepto.w });
      const hTra = doc.heightOfString(p.trabajador.nombre, { width: col.trabajador.w });
      const alto = Math.max(hCon, hTra, 10) + 8;

      if (y + alto > 720) {
        doc.addPage();
        y = 60;
        cabecera();
        doc.font('Helvetica').fontSize(8.5);
      }

      if (idx % 2 === 1) doc.rect(X, y, ANCHO, alto).fillColor(CREMA).fill();
      doc.fillColor(GRIS);
      doc.text(fechaCorta(new Date(p.fecha)), col.fecha.x, y + 4, { width: col.fecha.w });
      doc.fillColor(CAFE);
      doc.text(p.trabajador.nombre, col.trabajador.x, y + 4, { width: col.trabajador.w });
      doc.fillColor(GRIS);
      doc.text(p.concepto, col.concepto.x, y + 4, { width: col.concepto.w });
      doc.text(p.pedido?.codigo ?? '—', col.pedido.x, y + 4, { width: col.pedido.w });
      doc.text(METODO_CORTO[p.metodo] ?? p.metodo, col.metodo.x, y + 4, { width: col.metodo.w });
      doc.fillColor(CAFE);
      doc.text(soles(p.monto), col.monto.x, y + 4, { width: col.monto.w, align: 'right' });
      y += alto;
    });

    if (reporte.pagos.length === 0) {
      doc.fillColor(GRIS).fontSize(9);
      doc.text('No hay pagos en el periodo seleccionado.', X, y + 10, {
        width: ANCHO,
        align: 'center',
      });
      y += 30;
    }

    doc.moveTo(X, y).lineTo(X + ANCHO, y).lineWidth(0.5).strokeColor(BORDE).stroke();

    // ── Total por trabajador ──
    if (reporte.porTrabajador.length > 0) {
      y += 14;
      if (y > 660) {
        doc.addPage();
        y = 60;
      }
      doc.font('Helvetica-Bold').fontSize(10).fillColor(CAFE);
      doc.text('Total por trabajador', X, y);
      y += 16;
      doc.fontSize(9);
      for (const t of reporte.porTrabajador) {
        if (y > 730) {
          doc.addPage();
          y = 60;
        }
        doc.font('Helvetica').fillColor(CAFE);
        doc.text(`${t.nombre}  (${t.cantidad} pago${t.cantidad === 1 ? '' : 's'})`, X + 10, y, {
          width: 300,
        });
        doc.font('Helvetica-Bold');
        doc.text(soles(t.total), X + 355, y, { width: 130, align: 'right' });
        y += 15;
      }
      y += 2;
      doc.moveTo(X + 300, y).lineTo(X + ANCHO, y).lineWidth(0.75).strokeColor(BORDE).stroke();
      y += 8;
      doc.font('Helvetica-Bold').fontSize(11).fillColor(TERRACOTA);
      doc.text('TOTAL', X + 10, y);
      doc.text(soles(reporte.total), X + 355, y, { width: 130, align: 'right' });
    }

    // ── Pie ──
    doc.font('Helvetica').fontSize(8).fillColor(GRIS);
    doc.text('Documento interno — Qunuq Alpaca', X, 775, { width: ANCHO, align: 'center' });

    return doc;
  }
}
