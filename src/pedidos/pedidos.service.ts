import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoPedido, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

// IGV peruano: 18%.
const IGV_RATE = new Prisma.Decimal('0.18');

// Flujo de estados: solo avanza en este orden.
const ORDEN_ESTADOS: EstadoPedido[] = [
  'COTIZACION',
  'MUESTRA',
  'PRODUCCION',
  'ENTREGADO',
];

// Qué devolvemos al consultar un pedido (con su detalle legible).
const PEDIDO_INCLUDE = {
  cliente: true,
  items: {
    include: { producto: true, fibra: true, color: true, tecnica: true },
  },
} satisfies Prisma.PedidoInclude;

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePedidoDto) {
    // 1. El cliente debe existir.
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }

    // 2. Todos los productos deben existir.
    const productoIds = [...new Set(dto.items.map((i) => i.productoId))];
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds } },
    });
    const mapaProductos = new Map(productos.map((p) => [p.id, p]));
    for (const id of productoIds) {
      if (!mapaProductos.has(id)) {
        throw new BadRequestException(`El producto ${id} no existe`);
      }
    }

    // 3. Los catálogos referenciados (opcionales) deben existir.
    await this.validarCatalogo('fibra', dto.items.map((i) => i.fibraId));
    await this.validarCatalogo('color', dto.items.map((i) => i.colorId));
    await this.validarCatalogo('tecnica', dto.items.map((i) => i.tecnicaId));

    // 4. Calculamos montos en el backend (no confiamos del cliente).
    const itemsData = dto.items.map((i) => {
      const producto = mapaProductos.get(i.productoId)!;
      const precioUnitario = new Prisma.Decimal(
        i.precioUnitario ?? producto.precioBase,
      );
      const cantidad = new Prisma.Decimal(i.cantidad);
      const subtotal = precioUnitario.mul(cantidad).toDecimalPlaces(2);
      return {
        productoId: i.productoId,
        fibraId: i.fibraId ?? null,
        colorId: i.colorId ?? null,
        tecnicaId: i.tecnicaId ?? null,
        cantidad,
        precioUnitario,
        subtotal,
      };
    });

    const subtotal = itemsData
      .reduce((acc, it) => acc.add(it.subtotal), new Prisma.Decimal(0))
      .toDecimalPlaces(2);
    const igv = subtotal.mul(IGV_RATE).toDecimalPlaces(2);
    const total = subtotal.add(igv).toDecimalPlaces(2);

    // 5. Generamos el correlativo y creamos todo en una transacción.
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.pedido.count();
      const codigo = `PED-${String(count + 1).padStart(4, '0')}`;
      return tx.pedido.create({
        data: {
          codigo,
          clienteId: dto.clienteId,
          notas: dto.notas,
          subtotal,
          igv,
          total,
          items: { create: itemsData },
        },
        include: PEDIDO_INCLUDE,
      });
    });
  }

  findAll(filtros?: { estado?: EstadoPedido; clienteId?: string }) {
    return this.prisma.pedido.findMany({
      where: {
        estado: filtros?.estado,
        clienteId: filtros?.clienteId,
      },
      include: PEDIDO_INCLUDE,
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: PEDIDO_INCLUDE,
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  async update(id: string, dto: UpdatePedidoDto) {
    await this.findOne(id);
    return this.prisma.pedido.update({
      where: { id },
      data: { notas: dto.notas },
      include: PEDIDO_INCLUDE,
    });
  }

  async cambiarEstado(id: string, nuevo: EstadoPedido) {
    const pedido = await this.findOne(id);
    const actualIdx = ORDEN_ESTADOS.indexOf(pedido.estado);
    const nuevoIdx = ORDEN_ESTADOS.indexOf(nuevo);

    // Solo se permite avanzar (no repetir ni retroceder).
    if (nuevoIdx <= actualIdx) {
      throw new BadRequestException(
        `No se puede pasar de ${pedido.estado} a ${nuevo}. ` +
          `El flujo solo avanza: ${ORDEN_ESTADOS.join(' → ')}`,
      );
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: nuevo },
      include: PEDIDO_INCLUDE,
    });
  }

  async remove(id: string) {
    const pedido = await this.findOne(id);
    // Solo se borran borradores (cotizaciones); lo demás preserva historial.
    if (pedido.estado !== 'COTIZACION') {
      throw new ConflictException(
        'Solo se pueden eliminar pedidos en estado COTIZACION',
      );
    }
    await this.prisma.pedido.delete({ where: { id } }); // los ítems caen en cascada
    return { mensaje: 'Pedido eliminado' };
  }

  // Verifica que los ids de un catálogo (fibra/color/técnica) existan.
  private async validarCatalogo(
    modelo: 'fibra' | 'color' | 'tecnica',
    ids: (string | undefined)[],
  ) {
    const unicos = [...new Set(ids.filter((x): x is string => Boolean(x)))];
    if (unicos.length === 0) {
      return;
    }
    const encontrados = await (this.prisma[modelo] as any).findMany({
      where: { id: { in: unicos } },
      select: { id: true },
    });
    const set = new Set(encontrados.map((e: { id: string }) => e.id));
    for (const id of unicos) {
      if (!set.has(id)) {
        throw new BadRequestException(`El/la ${modelo} con id ${id} no existe`);
      }
    }
  }
}
