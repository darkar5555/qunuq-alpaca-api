import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoGasto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGastoDto, UpdateGastoDto } from './dto/create-gasto.dto';

export interface FiltrosGastos {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD (inclusive)
  tipo?: TipoGasto;
  categoria?: string;
}

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  // Lista filtrada + totales (general, por tipo y por categoría).
  async listar(filtros: FiltrosGastos) {
    const where: Prisma.GastoWhereInput = {
      tipo: filtros.tipo || undefined,
      categoria: filtros.categoria || undefined,
      fecha: {
        gte: filtros.desde ? new Date(`${filtros.desde}T00:00:00`) : undefined,
        lte: filtros.hasta ? new Date(`${filtros.hasta}T23:59:59.999`) : undefined,
      },
    };

    const gastos = await this.prisma.gasto.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });

    const cero = new Prisma.Decimal(0);
    const total = gastos.reduce((acc, g) => acc.add(g.monto), cero);

    const porTipo: Partial<Record<TipoGasto, Prisma.Decimal>> = {};
    const porCategoria = new Map<string, Prisma.Decimal>();
    for (const g of gastos) {
      porTipo[g.tipo] = (porTipo[g.tipo] ?? cero).add(g.monto);
      porCategoria.set(
        g.categoria,
        (porCategoria.get(g.categoria) ?? cero).add(g.monto),
      );
    }

    // Pagos al personal del mismo periodo: se registran en el módulo Personal
    // y aquí solo se muestran/suman (no se duplican como gastos).
    const agregadoPersonal = await this.prisma.pagoPersonal.aggregate({
      _sum: { monto: true },
      where: {
        fecha: {
          gte: filtros.desde ? new Date(`${filtros.desde}T00:00:00`) : undefined,
          lte: filtros.hasta ? new Date(`${filtros.hasta}T23:59:59.999`) : undefined,
        },
      },
    });
    const pagosPersonal = agregadoPersonal._sum.monto ?? cero;

    return {
      filtros,
      cantidad: gastos.length,
      total,
      pagosPersonal,
      egresosTotales: total.add(pagosPersonal),
      porTipo,
      porCategoria: [...porCategoria.entries()]
        .map(([categoria, monto]) => ({ categoria, monto }))
        .sort((a, b) => b.monto.comparedTo(a.monto)),
      gastos,
    };
  }

  crear(dto: CreateGastoDto) {
    return this.prisma.gasto.create({
      data: {
        monto: dto.monto,
        metodo: dto.metodo,
        tipo: dto.tipo,
        categoria: dto.categoria,
        descripcion: dto.descripcion,
        proveedor: dto.proveedor,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      },
    });
  }

  async actualizar(id: string, dto: UpdateGastoDto) {
    await this.getOrThrow(id);
    return this.prisma.gasto.update({
      where: { id },
      data: {
        monto: dto.monto,
        metodo: dto.metodo,
        tipo: dto.tipo,
        categoria: dto.categoria,
        descripcion: dto.descripcion,
        proveedor: dto.proveedor,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      },
    });
  }

  async eliminar(id: string) {
    await this.getOrThrow(id);
    await this.prisma.gasto.delete({ where: { id } });
    return { mensaje: 'Gasto eliminado' };
  }

  // ── Resumen financiero mensual ──
  // ingresos (pagos de clientes) − gastos − pagos al personal = utilidad.
  async resumen(meses = 6) {
    const ahora = new Date();
    const desde = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);

    const [pagosClientes, gastos, pagosPersonal] = await Promise.all([
      this.prisma.pago.findMany({ where: { fecha: { gte: desde } } }),
      this.prisma.gasto.findMany({ where: { fecha: { gte: desde } } }),
      this.prisma.pagoPersonal.findMany({ where: { fecha: { gte: desde } } }),
    ]);

    const cero = new Prisma.Decimal(0);
    const claveMes = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Prepara todos los meses del rango (aunque estén en cero).
    const porMes = new Map<
      string,
      {
        mes: string;
        ingresos: Prisma.Decimal;
        gastosFijos: Prisma.Decimal;
        gastosVariables: Prisma.Decimal;
        pagosPersonal: Prisma.Decimal;
      }
    >();
    for (let i = 0; i < meses; i++) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1) + i, 1);
      porMes.set(claveMes(d), {
        mes: claveMes(d),
        ingresos: cero,
        gastosFijos: cero,
        gastosVariables: cero,
        pagosPersonal: cero,
      });
    }

    for (const p of pagosClientes) {
      const m = porMes.get(claveMes(new Date(p.fecha)));
      if (m) m.ingresos = m.ingresos.add(p.monto);
    }
    for (const g of gastos) {
      const m = porMes.get(claveMes(new Date(g.fecha)));
      if (!m) continue;
      if (g.tipo === 'FIJO') m.gastosFijos = m.gastosFijos.add(g.monto);
      else m.gastosVariables = m.gastosVariables.add(g.monto);
    }
    for (const p of pagosPersonal) {
      const m = porMes.get(claveMes(new Date(p.fecha)));
      if (m) m.pagosPersonal = m.pagosPersonal.add(p.monto);
    }

    const filas = [...porMes.values()].map((m) => {
      const egresos = m.gastosFijos.add(m.gastosVariables).add(m.pagosPersonal);
      return { ...m, egresos, utilidad: m.ingresos.sub(egresos) };
    });

    const totales = filas.reduce(
      (acc, f) => ({
        ingresos: acc.ingresos.add(f.ingresos),
        gastosFijos: acc.gastosFijos.add(f.gastosFijos),
        gastosVariables: acc.gastosVariables.add(f.gastosVariables),
        pagosPersonal: acc.pagosPersonal.add(f.pagosPersonal),
        egresos: acc.egresos.add(f.egresos),
        utilidad: acc.utilidad.add(f.utilidad),
      }),
      {
        ingresos: cero,
        gastosFijos: cero,
        gastosVariables: cero,
        pagosPersonal: cero,
        egresos: cero,
        utilidad: cero,
      },
    );

    return { meses: filas, totales };
  }

  private async getOrThrow(id: string) {
    const gasto = await this.prisma.gasto.findUnique({ where: { id } });
    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }
    return gasto;
  }
}
