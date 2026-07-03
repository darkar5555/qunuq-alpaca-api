import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoSolicitud } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSolicitudDto } from './dto/solicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(private readonly prisma: PrismaService) {}

  // Pública: llega desde la landing.
  crear(dto: CrearSolicitudDto) {
    if (!dto.email && !dto.telefono) {
      throw new BadRequestException(
        'Debes dejar al menos un correo o un teléfono de contacto',
      );
    }
    return this.prisma.solicitud.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        interes: dto.interes,
        mensaje: dto.mensaje,
        diseno: dto.diseno,
        origen: dto.origen ?? 'formulario',
      },
    });
  }

  listar(estado?: EstadoSolicitud) {
    return this.prisma.solicitud.findMany({
      where: estado ? { estado } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async contarNuevas() {
    const nuevas = await this.prisma.solicitud.count({
      where: { estado: 'NUEVA' },
    });
    return { nuevas };
  }

  async obtener(id: string) {
    const solicitud = await this.prisma.solicitud.findUnique({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  async cambiarEstado(id: string, estado: EstadoSolicitud) {
    await this.obtener(id);
    return this.prisma.solicitud.update({ where: { id }, data: { estado } });
  }

  async eliminar(id: string) {
    await this.obtener(id);
    await this.prisma.solicitud.delete({ where: { id } });
    return { mensaje: 'Solicitud eliminada' };
  }
}
