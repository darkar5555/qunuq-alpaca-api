import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Facturación electrónica (Fase 2). De momento solo lectura.
@Injectable()
export class ComprobantesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.comprobante.findMany({ orderBy: { fechaEmision: 'desc' } });
  }
}
