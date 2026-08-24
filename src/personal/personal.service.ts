import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MetodoPago, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrabajadorDto,
  UpdateTrabajadorDto,
} from './dto/create-trabajador.dto';
import { CreatePagoPersonalDto } from './dto/create-pago-personal.dto';

export interface FiltrosReporte {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD (inclusive)
  trabajadorId?: string;
}

const PAGO_INCLUDE = {
  trabajador: { select: { id: true, nombre: true, oficio: true } },
  pedido: { select: { id: true, codigo: true } },
} satisfies Prisma.PagoPersonalInclude;

@Injectable()
export class PersonalService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Trabajadores ──

  listar() {
    return this.prisma.trabajador.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { pagos: true } } },
    });
  }

  async obtener(id: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id },
      include: {
        pagos: { include: PAGO_INCLUDE, orderBy: { fecha: 'desc' } },
      },
    });
    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }
    return trabajador;
  }

  crear(dto: CreateTrabajadorDto) {
    return this.prisma.trabajador.create({
      data: {
        nombre: dto.nombre,
        numeroDocumento: dto.numeroDocumento,
        telefono: dto.telefono,
        oficio: dto.oficio,
        fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : undefined,
        notas: dto.notas,
      },
    });
  }

  async actualizar(id: string, dto: UpdateTrabajadorDto) {
    await this.getOrThrow(id);
    return this.prisma.trabajador.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        numeroDocumento: dto.numeroDocumento,
        telefono: dto.telefono,
        oficio: dto.oficio,
        fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : undefined,
        notas: dto.notas,
        activo: dto.activo,
      },
    });
  }

  // Baja lógica: se desactiva para preservar el historial de pagos.
  async desactivar(id: string) {
    await this.getOrThrow(id);
    return this.prisma.trabajador.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ── Pagos ──

  async registrarPago(trabajadorId: string, dto: CreatePagoPersonalDto) {
    await this.getOrThrow(trabajadorId);

    if (dto.pedidoId) {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: dto.pedidoId },
      });
      if (!pedido) {
        throw new BadRequestException('El pedido indicado no existe');
      }
    }

    return this.prisma.pagoPersonal.create({
      data: {
        trabajadorId,
        pedidoId: dto.pedidoId,
        monto: dto.monto,
        metodo: dto.metodo,
        concepto: dto.concepto,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      },
      include: PAGO_INCLUDE,
    });
  }

  async anularPago(pagoId: string) {
    const pago = await this.prisma.pagoPersonal.findUnique({
      where: { id: pagoId },
    });
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    await this.prisma.pagoPersonal.delete({ where: { id: pagoId } });
    return { mensaje: 'Pago anulado' };
  }

  // ── Reporte ──

  async reporte(filtros: FiltrosReporte) {
    const where: Prisma.PagoPersonalWhereInput = {
      trabajadorId: filtros.trabajadorId || undefined,
      fecha: {
        gte: filtros.desde ? new Date(`${filtros.desde}T00:00:00`) : undefined,
        lte: filtros.hasta ? new Date(`${filtros.hasta}T23:59:59.999`) : undefined,
      },
    };

    const pagos = await this.prisma.pagoPersonal.findMany({
      where,
      include: PAGO_INCLUDE,
      orderBy: { fecha: 'desc' },
    });

    const cero = new Prisma.Decimal(0);
    const total = pagos.reduce((acc, p) => acc.add(p.monto), cero);

    // Total por método de pago.
    const porMetodo: Partial<Record<MetodoPago, Prisma.Decimal>> = {};
    for (const p of pagos) {
      porMetodo[p.metodo] = (porMetodo[p.metodo] ?? cero).add(p.monto);
    }

    // Total por trabajador.
    const mapa = new Map<string, { nombre: string; total: Prisma.Decimal; cantidad: number }>();
    for (const p of pagos) {
      const item = mapa.get(p.trabajadorId) ?? {
        nombre: p.trabajador.nombre,
        total: cero,
        cantidad: 0,
      };
      item.total = item.total.add(p.monto);
      item.cantidad += 1;
      mapa.set(p.trabajadorId, item);
    }
    const porTrabajador = [...mapa.entries()]
      .map(([id, v]) => ({ trabajadorId: id, ...v }))
      .sort((a, b) => b.total.comparedTo(a.total));

    return {
      filtros,
      cantidad: pagos.length,
      total,
      porMetodo,
      porTrabajador,
      pagos,
    };
  }

  private async getOrThrow(id: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id },
    });
    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }
    return trabajador;
  }
}
