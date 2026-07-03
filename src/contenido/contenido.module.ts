import { Module } from '@nestjs/common';
import { ContenidoController } from './contenido.controller';
import { ContenidoService } from './contenido.service';
import { PublicController } from './public.controller';

@Module({
  controllers: [ContenidoController, PublicController],
  providers: [ContenidoService],
})
export class ContenidoModule {}
