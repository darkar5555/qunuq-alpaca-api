import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { EstadoPedido, RolUsuario } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { CotizacionPdfService } from './cotizacion-pdf.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoDto, UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly cotizacionPdf: CotizacionPdfService,
  ) {}

  // Lectura: cualquier usuario autenticado. Filtros opcionales por query.
  @Get()
  findAll(
    @Query('estado') estado?: EstadoPedido,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.pedidosService.findAll({ estado, clienteId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  // Descarga la cotización del pedido en PDF: admin y ventas.
  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
  @Get(':id/cotizacion')
  async cotizacion(@Param('id') id: string, @Res() res: Response) {
    const pedido = await this.pedidosService.findOne(id);
    const doc = this.cotizacionPdf.generar(pedido);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cotizacion-${pedido.codigo}.pdf"`,
    });
    doc.pipe(res);
    doc.end();
  }

  // Crear pedido: admin y ventas.
  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
  @Post()
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  // Editar notas: admin y ventas.
  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.pedidosService.update(id, dto);
  }

  // Avanzar el estado: admin, ventas y producción.
  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS, RolUsuario.PRODUCCION)
  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.pedidosService.cambiarEstado(id, dto.estado);
  }

  // Eliminar (solo cotizaciones): admin.
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }
}
