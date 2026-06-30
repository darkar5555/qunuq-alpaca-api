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
import { RolUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // Lectura: cualquier usuario autenticado. ?activo=true filtra solo activos.
  @Get()
  findAll(@Query('activo') activo?: string) {
    return this.productosService.findAll(activo === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(id, dto);
  }

  // Desactivar producto: solo admin.
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
