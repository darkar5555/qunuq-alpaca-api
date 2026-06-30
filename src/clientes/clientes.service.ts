import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoDocumento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  // DNI = 8 dígitos, RUC = 11 dígitos.
  private validarDocumento(tipo: TipoDocumento, numero: string) {
    if (tipo === 'DNI' && numero.length !== 8) {
      throw new BadRequestException('El DNI debe tener 8 dígitos');
    }
    if (tipo === 'RUC' && numero.length !== 11) {
      throw new BadRequestException('El RUC debe tener 11 dígitos');
    }
  }

  async create(dto: CreateClienteDto) {
    this.validarDocumento(dto.tipoDocumento, dto.numeroDocumento);
    try {
      return await this.prisma.cliente.create({ data: dto });
    } catch (e) {
      throw this.traducirError(e);
    }
  }

  findAll() {
    return this.prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    const actual = await this.findOne(id);
    // Valida con los valores resultantes (los nuevos o, si no vienen, los actuales).
    this.validarDocumento(
      dto.tipoDocumento ?? actual.tipoDocumento,
      dto.numeroDocumento ?? actual.numeroDocumento,
    );
    try {
      return await this.prisma.cliente.update({ where: { id }, data: dto });
    } catch (e) {
      throw this.traducirError(e);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    // No permitimos borrar clientes con pedidos (preserva el historial).
    const pedidos = await this.prisma.pedido.count({ where: { clienteId: id } });
    if (pedidos > 0) {
      throw new ConflictException(
        'No se puede eliminar: el cliente tiene pedidos registrados',
      );
    }
    await this.prisma.cliente.delete({ where: { id } });
    return { mensaje: 'Cliente eliminado' };
  }

  // Convierte el error de documento duplicado de Prisma en un 409 legible.
  private traducirError(e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new ConflictException(
        'Ya existe un cliente con ese tipo y número de documento',
      );
    }
    return e;
  }
}
