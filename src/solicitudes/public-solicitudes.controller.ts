import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { CrearSolicitudDto } from './dto/solicitud.dto';
import { SolicitudesService } from './solicitudes.service';

// Endpoint PÚBLICO para recibir cotizaciones desde la landing.
// Límite anti-spam: máx. 5 envíos por minuto por IP.
@Public()
@Controller('public/solicitudes')
export class PublicSolicitudesController {
  constructor(private readonly solicitudes: SolicitudesService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  crear(@Body() dto: CrearSolicitudDto) {
    return this.solicitudes.crear(dto);
  }
}
