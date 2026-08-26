import { Module } from '@nestjs/common';
import { GastosController } from './gastos.controller';
import { GastosPdfService } from './gastos-pdf.service';
import { GastosService } from './gastos.service';

@Module({
  controllers: [GastosController],
  providers: [GastosService, GastosPdfService],
})
export class GastosModule {}
