import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Catálogos que alimentan el configurador "Diseña tu tejido".
@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  fibras() {
    return this.prisma.fibra.findMany({ orderBy: { nombre: 'asc' } });
  }

  colores() {
    return this.prisma.color.findMany({ orderBy: { nombre: 'asc' } });
  }

  tecnicas() {
    return this.prisma.tecnica.findMany({ orderBy: { nombre: 'asc' } });
  }
}
