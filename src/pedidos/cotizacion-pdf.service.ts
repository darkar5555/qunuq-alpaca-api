import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PedidosService } from './pedidos.service';

type PedidoDetalle = Awaited<ReturnType<PedidosService['findOne']>>;

// Paleta de la marca (la misma del ERP y la landing).
const TERRACOTA = '#b5674d';
const CAFE = '#4a3f33';
const CREMA = '#faf7f2';
const GRIS = '#8a7d6f';
const BORDE = '#e4d8c2';

const DIAS_VALIDEZ = 15;

const CONTACTO = [
  'Jr. Alfonso Ugarte 112, La Tomilla, Cayma - Arequipa',
  '+51 993 064 492',
  'qunuqalpaca@hotmail.com',
];

// Formato de montos: S/ 1,234.56
const soles = (v: unknown) =>
  `S/ ${Number(v).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fechaCorta = (d: Date) =>
  d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

@Injectable()
export class CotizacionPdfService {
  // Devuelve el documento con todo el contenido escrito (falta hacer .end()).
  generar(pedido: PedidoDetalle): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Cotización ${pedido.codigo} — Qunuq Alpaca`,
        Author: 'Qunuq Alpaca',
      },
    });

    const X = 50; // margen izquierdo
    const ANCHO = 495; // ancho útil (A4 = 595pt - márgenes)

    // ── Cabecera de marca ──
    doc.font('Helvetica-Bold').fontSize(20).fillColor(TERRACOTA);
    doc.text('Qunuq Alpaca', X, 50);
    doc.font('Helvetica').fontSize(9).fillColor(GRIS);
    doc.text('Tejidos de alpaca personalizados', X, 74);

    let yCont = 52;
    doc.fontSize(8.5);
    for (const linea of CONTACTO) {
      doc.text(linea, X + 200, yCont, { width: ANCHO - 200, align: 'right' });
      yCont += 12;
    }

    doc.moveTo(X, 98).lineTo(X + ANCHO, 98).lineWidth(1.5).strokeColor(TERRACOTA).stroke();

    // ── Título y fechas ──
    const emision = new Date(pedido.fecha);
    const vence = new Date(emision.getTime() + DIAS_VALIDEZ * 24 * 60 * 60 * 1000);

    doc.font('Helvetica-Bold').fontSize(15).fillColor(CAFE);
    doc.text(`COTIZACIÓN ${pedido.codigo}`, X, 112);
    doc.font('Helvetica').fontSize(9).fillColor(GRIS);
    doc.text(
      `Emitida el ${fechaCorta(emision)}  ·  Válida hasta el ${fechaCorta(vence)}`,
      X,
      132,
    );

    // ── Datos del cliente ──
    const c = pedido.cliente;
    const yCli = 152;
    doc.roundedRect(X, yCli, ANCHO, 54, 6).fillColor(CREMA).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GRIS);
    doc.text('CLIENTE', X + 14, yCli + 9);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(CAFE);
    doc.text(c.nombreORazonSocial, X + 14, yCli + 21, { width: ANCHO - 28 });
    doc.font('Helvetica').fontSize(9).fillColor(GRIS);
    const datos = [
      `${c.tipoDocumento}: ${c.numeroDocumento}`,
      c.email ?? null,
      c.telefono ?? null,
    ].filter(Boolean);
    doc.text(datos.join('   ·   '), X + 14, yCli + 37, { width: ANCHO - 28 });

    // ── Tabla de ítems ──
    // Columnas: producto | detalle | cant | p.unit | subtotal
    const col = {
      producto: { x: X + 10, w: 165 },
      detalle: { x: X + 180, w: 130 },
      cant: { x: X + 315, w: 45 },
      punit: { x: X + 365, w: 60 },
      subtotal: { x: X + 430, w: 55 },
    };

    let y = 226;
    const cabeceraTabla = () => {
      doc.rect(X, y, ANCHO, 20).fillColor(CAFE).fill();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
      doc.text('PRODUCTO', col.producto.x, y + 6, { width: col.producto.w });
      doc.text('DETALLE', col.detalle.x, y + 6, { width: col.detalle.w });
      doc.text('CANT.', col.cant.x, y + 6, { width: col.cant.w, align: 'right' });
      doc.text('P. UNIT.', col.punit.x, y + 6, { width: col.punit.w, align: 'right' });
      doc.text('SUBTOTAL', col.subtotal.x, y + 6, { width: col.subtotal.w, align: 'right' });
      y += 20;
    };
    cabeceraTabla();

    doc.font('Helvetica').fontSize(9);
    pedido.items.forEach((it, idx) => {
      const detalle =
        [it.fibra?.nombre, it.color?.nombre, it.tecnica?.nombre]
          .filter(Boolean)
          .join(' · ') || '—';

      const hProducto = doc.heightOfString(it.producto.nombre, { width: col.producto.w });
      const hDetalle = doc.heightOfString(detalle, { width: col.detalle.w });
      const alto = Math.max(hProducto, hDetalle, 10) + 10;

      // Salto de página si no entra la fila.
      if (y + alto > 700) {
        doc.addPage();
        y = 60;
        cabeceraTabla();
        doc.font('Helvetica').fontSize(9);
      }

      if (idx % 2 === 1) {
        doc.rect(X, y, ANCHO, alto).fillColor(CREMA).fill();
      }
      doc.fillColor(CAFE);
      doc.text(it.producto.nombre, col.producto.x, y + 5, { width: col.producto.w });
      doc.fillColor(GRIS);
      doc.text(detalle, col.detalle.x, y + 5, { width: col.detalle.w });
      doc.fillColor(CAFE);
      doc.text(String(Number(it.cantidad)), col.cant.x, y + 5, {
        width: col.cant.w,
        align: 'right',
      });
      doc.text(soles(it.precioUnitario), col.punit.x, y + 5, {
        width: col.punit.w,
        align: 'right',
      });
      doc.text(soles(it.subtotal), col.subtotal.x, y + 5, {
        width: col.subtotal.w,
        align: 'right',
      });
      y += alto;
    });

    doc.moveTo(X, y).lineTo(X + ANCHO, y).lineWidth(0.5).strokeColor(BORDE).stroke();

    // ── Totales ──
    y += 12;
    const filaTotal = (etiqueta: string, valor: string, destacado = false) => {
      doc
        .font(destacado ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(destacado ? 12 : 9.5)
        .fillColor(destacado ? TERRACOTA : GRIS);
      doc.text(etiqueta, X + 280, y, { width: 130, align: 'right' });
      doc.fillColor(destacado ? TERRACOTA : CAFE);
      doc.text(valor, X + 415, y, { width: 80, align: 'right' });
      y += destacado ? 20 : 16;
    };
    filaTotal('Subtotal', soles(pedido.subtotal));
    filaTotal('IGV (18%)', soles(pedido.igv));
    doc.moveTo(X + 300, y).lineTo(X + ANCHO, y).lineWidth(0.75).strokeColor(BORDE).stroke();
    y += 6;
    filaTotal('TOTAL', soles(pedido.total), true);

    // ── Notas del pedido ──
    if (pedido.notas) {
      y += 8;
      doc.font('Helvetica-Oblique').fontSize(9).fillColor(GRIS);
      doc.text(`Notas: ${pedido.notas}`, X, y, { width: ANCHO });
      y = doc.y + 4;
    }

    // ── Condiciones ──
    y += 10;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(CAFE);
    doc.text('Condiciones', X, y);
    y += 13;
    doc.font('Helvetica').fontSize(8.5).fillColor(GRIS);
    const condiciones = [
      `Cotización válida por ${DIAS_VALIDEZ} días desde su emisión.`,
      'Precios expresados en soles (PEN); el total incluye IGV.',
      'Los plazos de entrega se coordinan al confirmar el pedido.',
    ];
    for (const cond of condiciones) {
      doc.text(`•  ${cond}`, X, y, { width: ANCHO });
      y = doc.y + 3;
    }

    // ── Pie de página ──
    doc.font('Helvetica').fontSize(8).fillColor(GRIS);
    doc.text(
      `Qunuq Alpaca  ·  ${CONTACTO[0]}  ·  ${CONTACTO[1]}  ·  ${CONTACTO[2]}`,
      X,
      770,
      { width: ANCHO, align: 'center' },
    );

    return doc;
  }
}
