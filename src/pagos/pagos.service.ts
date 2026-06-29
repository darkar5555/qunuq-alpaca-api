import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pago.findMany({ orderBy: { fecha: 'desc' } });
  }
}
