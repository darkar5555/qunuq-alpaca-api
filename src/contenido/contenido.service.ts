import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContenidoService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Textos ──────────────────────────────────────────

  // Lista completa con metadatos (para editar en el ERP).
  listarContenido() {
    return this.prisma.contenidoSitio.findMany({
      orderBy: [{ grupo: 'asc' }, { orden: 'asc' }],
    });
  }

  // Mapa { clave: valor } (para la landing).
  async mapaContenido() {
    const filas = await this.prisma.contenidoSitio.findMany();
    return Object.fromEntries(filas.map((f) => [f.clave, f.valor]));
  }

  async actualizarContenido(clave: string, valor: string) {
    const existe = await this.prisma.contenidoSitio.findUnique({
      where: { clave },
    });
    if (!existe) {
      throw new NotFoundException(`No existe el contenido "${clave}"`);
    }
    return this.prisma.contenidoSitio.update({
      where: { clave },
      data: { valor },
    });
  }

  // ── Imágenes ────────────────────────────────────────

  listarImagenes(seccion?: string) {
    return this.prisma.imagenSitio.findMany({
      where: seccion ? { seccion } : undefined,
      orderBy: [{ seccion: 'asc' }, { orden: 'asc' }],
    });
  }

  // Solo las activas, para la landing.
  listarImagenesPublicas(seccion?: string) {
    return this.prisma.imagenSitio.findMany({
      where: { activo: true, ...(seccion ? { seccion } : {}) },
      orderBy: [{ seccion: 'asc' }, { orden: 'asc' }],
    });
  }

  crearImagen(data: { seccion: string; url: string; titulo?: string }) {
    return this.prisma.imagenSitio.create({ data });
  }

  async actualizarImagen(
    id: string,
    data: { titulo?: string; orden?: number; activo?: boolean },
  ) {
    await this.buscarImagen(id);
    return this.prisma.imagenSitio.update({ where: { id }, data });
  }

  async eliminarImagen(id: string) {
    const imagen = await this.buscarImagen(id);
    await this.prisma.imagenSitio.delete({ where: { id } });
    // Borra también el archivo físico (si es local).
    if (imagen.url.startsWith('/uploads/')) {
      const ruta = join(process.cwd(), imagen.url);
      await unlink(ruta).catch(() => undefined); // no falla si ya no existe
    }
    return { mensaje: 'Imagen eliminada' };
  }

  private async buscarImagen(id: string) {
    const imagen = await this.prisma.imagenSitio.findUnique({ where: { id } });
    if (!imagen) {
      throw new NotFoundException('Imagen no encontrada');
    }
    return imagen;
  }

  // ── Catálogo público (para el configurador de la landing) ──
  async catalogoPublico() {
    const [fibras, colores, tecnicas, productos] = await Promise.all([
      this.prisma.fibra.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.color.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.tecnica.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.producto.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
    ]);
    return { fibras, colores, tecnicas, productos };
  }
}
