import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCatalogoDto,
  CreateColorDto,
  UpdateCatalogoDto,
  UpdateColorDto,
} from './dto/catalogo.dto';

// Catálogos que alimentan el configurador "Diseña tu tejido".
@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Fibras ───────────────────────────────────────────
  fibras() {
    return this.prisma.fibra.findMany({ orderBy: { nombre: 'asc' } });
  }

  async crearFibra(dto: CreateCatalogoDto) {
    try {
      return await this.prisma.fibra.create({ data: dto });
    } catch (e) {
      throw this.traducir(e, 'la fibra');
    }
  }

  async actualizarFibra(id: string, dto: UpdateCatalogoDto) {
    try {
      return await this.prisma.fibra.update({ where: { id }, data: dto });
    } catch (e) {
      throw this.traducir(e, 'la fibra');
    }
  }

  eliminarFibra(id: string) {
    return this.desactivar('fibra', id, 'la fibra');
  }

  // ── Colores ──────────────────────────────────────────
  colores() {
    return this.prisma.color.findMany({ orderBy: { nombre: 'asc' } });
  }

  async crearColor(dto: CreateColorDto) {
    try {
      return await this.prisma.color.create({ data: dto });
    } catch (e) {
      throw this.traducir(e, 'el color');
    }
  }

  async actualizarColor(id: string, dto: UpdateColorDto) {
    try {
      return await this.prisma.color.update({ where: { id }, data: dto });
    } catch (e) {
      throw this.traducir(e, 'el color');
    }
  }

  eliminarColor(id: string) {
    return this.desactivar('color', id, 'el color');
  }

  // ── Técnicas ─────────────────────────────────────────
  tecnicas() {
    return this.prisma.tecnica.findMany({ orderBy: { nombre: 'asc' } });
  }

  async crearTecnica(dto: CreateCatalogoDto) {
    try {
      return await this.prisma.tecnica.create({ data: dto });
    } catch (e) {
      throw this.traducir(e, 'la técnica');
    }
  }

  async actualizarTecnica(id: string, dto: UpdateCatalogoDto) {
    try {
      return await this.prisma.tecnica.update({ where: { id }, data: dto });
    } catch (e) {
      throw this.traducir(e, 'la técnica');
    }
  }

  eliminarTecnica(id: string) {
    return this.desactivar('tecnica', id, 'la técnica');
  }

  // ── Helpers ──────────────────────────────────────────

  // Baja lógica genérica para los tres catálogos.
  private async desactivar(
    modelo: 'fibra' | 'color' | 'tecnica',
    id: string,
    etiqueta: string,
  ) {
    try {
      return await (this.prisma[modelo] as any).update({
        where: { id },
        data: { activo: false },
      });
    } catch (e) {
      throw this.traducir(e, etiqueta);
    }
  }

  // Traduce errores de Prisma a respuestas HTTP legibles.
  private traducir(e: unknown, etiqueta: string) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return new ConflictException(`Ya existe ${etiqueta} con ese nombre`);
      }
      if (e.code === 'P2025') {
        return new NotFoundException(
          `No se encontró ${etiqueta} con ese identificador`,
        );
      }
    }
    return e;
  }
}
