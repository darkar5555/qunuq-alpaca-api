import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  // Lista los pagos; si se pasa pedidoId, solo los de ese pedido.
  findAll(pedidoId?: string) {
    return this.prisma.pago.findMany({
      where: { pedidoId: pedidoId ?? undefined },
      orderBy: { fecha: 'desc' },
    });
  }

  async create(dto: CreatePagoDto) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      include: { pagos: true },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const pagado = pedido.pagos.reduce(
      (acc, p) => acc.add(p.monto),
      new Prisma.Decimal(0),
    );
    const saldo = pedido.total.sub(pagado);
    const monto = new Prisma.Decimal(dto.monto);

    // No se permite registrar más que el saldo pendiente.
    if (monto.greaterThan(saldo)) {
      throw new BadRequestException(
        `El monto (S/ ${monto.toFixed(2)}) excede el saldo pendiente (S/ ${saldo.toFixed(2)})`,
      );
    }

    return this.prisma.pago.create({
      data: {
        pedidoId: dto.pedidoId,
        monto,
        metodo: dto.metodo,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      },
    });
  }

  async remove(id: string) {
    const pago = await this.prisma.pago.findUnique({ where: { id } });
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    await this.prisma.pago.delete({ where: { id } });
    return { mensaje: 'Pago anulado' };
  }
}
