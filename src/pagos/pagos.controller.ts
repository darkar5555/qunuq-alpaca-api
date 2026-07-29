import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // Lectura: cualquier usuario autenticado. Filtro opcional por pedido.
  @Get()
  findAll(@Query('pedidoId') pedidoId?: string) {
    return this.pagosService.findAll(pedidoId);
  }

  // Registrar un pago: admin y ventas.
  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
  @Post()
  create(@Body() dto: CreatePagoDto) {
    return this.pagosService.create(dto);
  }

  // Anular un pago: solo admin.
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(id);
  }
}
