import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { InsumosService } from './insumos.service';

@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  // Lectura: cualquier usuario autenticado.
  @Get()
  findAll() {
    return this.insumosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  // Gestión de inventario: admin y producción.
  @Roles(RolUsuario.ADMIN, RolUsuario.PRODUCCION)
  @Post()
  create(@Body() dto: CreateInsumoDto) {
    return this.insumosService.create(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.PRODUCCION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsumoDto) {
    return this.insumosService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.insumosService.remove(id);
  }

  // Registrar entrada/salida (ajusta el stock).
  @Roles(RolUsuario.ADMIN, RolUsuario.PRODUCCION)
  @Post(':id/movimientos')
  registrarMovimiento(
    @Param('id') id: string,
    @Body() dto: CreateMovimientoDto,
  ) {
    return this.insumosService.registrarMovimiento(id, dto);
  }
}
