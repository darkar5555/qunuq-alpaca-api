import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Inventario y producción (Fase 3). De momento solo lectura.
@Injectable()
export class InsumosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.insumo.findMany({ orderBy: { nombre: 'asc' } });
  }
}
