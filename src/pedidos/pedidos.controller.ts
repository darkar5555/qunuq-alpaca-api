import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EstadoPedido, RolUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoDto, UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

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
