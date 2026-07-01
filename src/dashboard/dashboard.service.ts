import { Injectable } from '@nestjs/common';
import { EstadoPedido, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ESTADOS: EstadoPedido[] = [
  'COTIZACION',
  'MUESTRA',
  'PRODUCCION',
  'ENTREGADO',
];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Números clave para la portada del ERP.
  async resumen() {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [totalClientes, productosActivos, agrupado, ventasMes, recientes] =
      await Promise.all([
        this.prisma.cliente.count(),
        this.prisma.producto.count({ where: { activo: true } }),
        this.prisma.pedido.groupBy({ by: ['estado'], _count: true }),
        this.prisma.pedido.aggregate({
          where: { fecha: { gte: inicioMes } },
          _sum: { total: true },
          _count: true,
        }),
        this.prisma.pedido.findMany({
          take: 5,
          orderBy: { fecha: 'desc' },
          include: { cliente: { select: { nombreORazonSocial: true } } },
        }),
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

    return {
      totalClientes,
      productosActivos,
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
      where: { fecha: { gte: desde } },
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
