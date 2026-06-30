import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductoDto) {
    return this.prisma.producto.create({ data: dto });
  }

  findAll(soloActivos = false) {
    return this.prisma.producto.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(id: string, dto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  // Baja lógica: desactivamos en vez de borrar (no rompe pedidos que lo usen).
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
  }
}
