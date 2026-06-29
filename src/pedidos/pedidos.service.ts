import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pedido.findMany({
      include: { cliente: true, items: true },
      orderBy: { fecha: 'desc' },
    });
  }
}
