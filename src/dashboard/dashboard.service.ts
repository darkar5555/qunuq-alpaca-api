import { Injectable } from '@nestjs/common';
import { EstadoPedido, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Una cotización aún no es una venta: solo contamos pedidos confirmados
// (muestra, producción o entregado) al calcular montos de ventas.
const SOLO_VENTAS: Prisma.PedidoWhereInput = {
  estado: { not: 'COTIZACION' },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Números clave para la portada del ERP.
  async resumen(rol?: string) {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [
      totalClientes,
      productosActivos,
      agrupado,
      ventasMes,
      recientes,
      pedidosConPagos,
      insumos,
      solicitudesNuevas,
    ] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.producto.count({ where: { activo: true } }),
      this.prisma.pedido.groupBy({ by: ['estado'], _count: true }),
      this.prisma.pedido.aggregate({
        where: { fecha: { gte: inicioMes }, ...SOLO_VENTAS },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.pedido.findMany({
        take: 5,
        orderBy: { fecha: 'desc' },
        include: { cliente: { select: { nombreORazonSocial: true } } },
      }),
      // Para "por cobrar": pedidos confirmados con sus pagos.
      this.prisma.pedido.findMany({
        where: SOLO_VENTAS,
        select: { total: true, pagos: { select: { monto: true } } },
      }),
      this.prisma.insumo.findMany({
        select: { nombre: true, stockActual: true, stockMinimo: true },
      }),
      this.prisma.solicitud.count({ where: { estado: 'NUEVA' } }),
    ]);

    // Normalizamos: todos los estados presentes, con 0 si no hay ninguno.
    const pedidosPorEstado: Record<EstadoPedido, number> = {
      COTIZACION: 0,
      MUESTRA: 0,
      PRODUCCION: 0,
      ENTREGADO: 0,
    };
    for (const g of agrupado) {
      pedidosPorEstado[g.estado] = g._count;
    }

    const cero = new Prisma.Decimal(0);

    // Saldo pendiente de cobro (total − pagado, solo si queda saldo).
    const porCobrar = pedidosConPagos.reduce((acc, p) => {
      const pagado = p.pagos.reduce((a, x) => a.add(x.monto), cero);
      const saldo = p.total.sub(pagado);
      return saldo.greaterThan(0) ? acc.add(saldo) : acc;
    }, cero);

    // Insumos en o por debajo del stock mínimo.
    const enAlerta = insumos.filter((i) =>
      i.stockActual.lessThanOrEqualTo(i.stockMinimo),
    );
    const bajoStock = {
      cantidad: enAlerta.length,
      nombres: enAlerta.slice(0, 5).map((i) => i.nombre),
    };

    // Finanzas del mes: información sensible → solo para ADMIN.
    let finanzasMes: {
      ingresos: Prisma.Decimal;
      egresos: Prisma.Decimal;
      utilidad: Prisma.Decimal;
    } | null = null;
    if (rol === 'ADMIN') {
      const [pagosMes, gastosMes, personalMes] = await Promise.all([
        this.prisma.pago.aggregate({
          _sum: { monto: true },
          where: { fecha: { gte: inicioMes } },
        }),
        this.prisma.gasto.aggregate({
          _sum: { monto: true },
          where: { fecha: { gte: inicioMes } },
        }),
        this.prisma.pagoPersonal.aggregate({
          _sum: { monto: true },
          where: { fecha: { gte: inicioMes } },
        }),
      ]);
      const ingresos = pagosMes._sum.monto ?? cero;
      const egresos = (gastosMes._sum.monto ?? cero).add(
        personalMes._sum.monto ?? cero,
      );
      finanzasMes = { ingresos, egresos, utilidad: ingresos.sub(egresos) };
    }

    return {
      totalClientes,
      productosActivos,
      porCobrar,
      bajoStock,
      solicitudesNuevas,
      finanzasMes,
      pedidosPorEstado,
      ventasDelMes: {
        cantidad: ventasMes._count,
        monto: ventasMes._sum.total ?? new Prisma.Decimal(0),
      },
      pedidosRecientes: recientes.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        cliente: p.cliente.nombreORazonSocial,
        estado: p.estado,
        total: p.total,
        fecha: p.fecha,
      })),
    };
  }

  // Monto vendido por mes en los últimos N meses (para un gráfico).
  async ventasPorMes(meses: number) {
    const ahora = new Date();
    const desde = new Date(
      ahora.getFullYear(),
      ahora.getMonth() - (meses - 1),
      1,
    );

    const pedidos = await this.prisma.pedido.findMany({
      where: { fecha: { gte: desde }, ...SOLO_VENTAS },
      select: { fecha: true, total: true },
    });

    // Preparamos un casillero por mes (aunque no tenga ventas → 0).
    const buckets = Array.from({ length: meses }, (_, i) => {
      const d = new Date(
        ahora.getFullYear(),
        ahora.getMonth() - (meses - 1) + i,
        1,
      );
      return { mes: this.claveMes(d), monto: new Prisma.Decimal(0) };
    });
    const indicePorMes = new Map(buckets.map((b, i) => [b.mes, i]));

    for (const p of pedidos) {
      const i = indicePorMes.get(this.claveMes(p.fecha));
      if (i !== undefined) {
        buckets[i].monto = buckets[i].monto.add(p.total);
      }
    }
    return buckets;
  }

  private claveMes(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
