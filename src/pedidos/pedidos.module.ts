import { Module } from '@nestjs/common';
import { CotizacionPdfService } from './cotizacion-pdf.service';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, CotizacionPdfService],
})
export class PedidosModule {}
