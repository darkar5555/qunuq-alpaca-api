import { Module } from '@nestjs/common';
import { PublicSolicitudesController } from './public-solicitudes.controller';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';

@Module({
  controllers: [SolicitudesController, PublicSolicitudesController],
  providers: [SolicitudesService],
})
export class SolicitudesModule {}
