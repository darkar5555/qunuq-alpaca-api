import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { EstadoSolicitud, RolUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CambiarEstadoSolicitudDto } from './dto/solicitud.dto';
import { SolicitudesService } from './solicitudes.service';

// Bandeja de solicitudes en el ERP. Admin y ventas.
@Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudes: SolicitudesService) {}

  @Get()
  listar(@Query('estado') estado?: EstadoSolicitud) {
    return this.solicitudes.listar(estado);
  }

  // Contador de nuevas (para el badge del menú).
  @Get('nuevas')
  contarNuevas() {
    return this.solicitudes.contarNuevas();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.solicitudes.obtener(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoSolicitudDto,
  ) {
    return this.solicitudes.cambiarEstado(id, dto.estado);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.solicitudes.eliminar(id);
  }
}
