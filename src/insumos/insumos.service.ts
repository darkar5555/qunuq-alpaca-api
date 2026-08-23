import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class InsumosService {
  constructor(private readonly prisma: PrismaService) {}

  // Agrega el campo calculado bajoStock (stockActual <= stockMinimo).
  private conEstado<
    T extends { stockActual: Prisma.Decimal; stockMinimo: Prisma.Decimal },
  >(insumo: T) {
    return {
      ...insumo,
      bajoStock: insumo.stockActual.lessThanOrEqualTo(insumo.stockMinimo),
    };
  }

  async findAll() {
    const insumos = await this.prisma.insumo.findMany({
      orderBy: { nombre: 'asc' },
    });
    return insumos.map((i) => this.conEstado(i));
  }

  async findOne(id: string) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
      include: { movimientos: { orderBy: { fecha: 'desc' } } },
    });
    if (!insumo) {
      throw new NotFoundException('Insumo no encontrado');
    }
    return this.conEstado(insumo);
  }

  async create(dto: CreateInsumoDto) {
    const insumo = await this.prisma.$transaction(async (tx) => {
      const creado = await tx.insumo.create({
        data: {
          nombre: dto.nombre,
          tipo: dto.tipo,
          unidad: dto.unidad,
          stockMinimo: dto.stockMinimo ?? 0,
        },
      });

      // Stock inicial → queda registrado como una ENTRADA (mantiene el historial).
      if (dto.stockInicial && dto.stockInicial > 0) {
        await tx.movimientoInventario.create({
          data: {
            insumoId: creado.id,
            tipo: 'ENTRADA',
            cantidad: dto.stockInicial,
            referencia: 'Stock inicial',
          },
        });
        return tx.insumo.update({
          where: { id: creado.id },
          data: { stockActual: dto.stockInicial },
        });
      }
      return creado;
    });

    return this.conEstado(insumo);
  }

  async update(id: string, dto: UpdateInsumoDto) {
    await this.getOrThrow(id);
    const insumo = await this.prisma.insumo.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        unidad: dto.unidad,
        stockMinimo: dto.stockMinimo,
      },
    });
    return this.conEstado(insumo);
  }

  async remove(id: string) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
      include: { _count: { select: { movimientos: true } } },
    });
    if (!insumo) {
      throw new NotFoundException('Insumo no encontrado');
    }
    if (insumo._count.movimientos > 0) {
      throw new ConflictException(
        'No se puede eliminar: el insumo tiene movimientos registrados.',
      );
    }
    await this.prisma.insumo.delete({ where: { id } });
    return { mensaje: 'Insumo eliminado' };
  }

  // Registra entrada/salida y ajusta el stock en una transacción.
  async registrarMovimiento(id: string, dto: CreateMovimientoDto) {
    const insumo = await this.getOrThrow(id);
    const cantidad = new Prisma.Decimal(dto.cantidad);

    if (dto.tipo === 'SALIDA' && cantidad.greaterThan(insumo.stockActual)) {
      throw new BadRequestException(
        `No hay stock suficiente: disponible ${insumo.stockActual.toFixed(2)} ${insumo.unidad}, intentas sacar ${cantidad.toFixed(2)}.`,
      );
    }

    const nuevoStock =
      dto.tipo === 'ENTRADA'
        ? insumo.stockActual.add(cantidad)
        : insumo.stockActual.sub(cantidad);

    await this.prisma.$transaction([
      this.prisma.movimientoInventario.create({
        data: {
          insumoId: id,
          tipo: dto.tipo,
          cantidad,
          referencia: dto.referencia,
        },
      }),
      this.prisma.insumo.update({
        where: { id },
        data: { stockActual: nuevoStock },
      }),
    ]);

    return this.findOne(id);
  }

  private async getOrThrow(id: string) {
    const insumo = await this.prisma.insumo.findUnique({ where: { id } });
    if (!insumo) {
      throw new NotFoundException('Insumo no encontrado');
    }
    return insumo;
  }
}
