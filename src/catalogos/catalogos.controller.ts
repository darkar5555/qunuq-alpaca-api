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
import { CatalogosService } from './catalogos.service';
import {
  CreateCatalogoDto,
  CreateColorDto,
  UpdateCatalogoDto,
  UpdateColorDto,
} from './dto/catalogo.dto';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogos: CatalogosService) {}

  // ── Fibras ───────────────────────────────────────────
  @Get('fibras')
  fibras() {
    return this.catalogos.fibras();
  }

  @Roles(RolUsuario.ADMIN)
  @Post('fibras')
  crearFibra(@Body() dto: CreateCatalogoDto) {
    return this.catalogos.crearFibra(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch('fibras/:id')
  actualizarFibra(@Param('id') id: string, @Body() dto: UpdateCatalogoDto) {
    return this.catalogos.actualizarFibra(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete('fibras/:id')
  eliminarFibra(@Param('id') id: string) {
    return this.catalogos.eliminarFibra(id);
  }

  // ── Colores ──────────────────────────────────────────
  @Get('colores')
  colores() {
    return this.catalogos.colores();
  }

  @Roles(RolUsuario.ADMIN)
  @Post('colores')
  crearColor(@Body() dto: CreateColorDto) {
    return this.catalogos.crearColor(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch('colores/:id')
  actualizarColor(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    return this.catalogos.actualizarColor(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete('colores/:id')
  eliminarColor(@Param('id') id: string) {
    return this.catalogos.eliminarColor(id);
  }

  // ── Técnicas ─────────────────────────────────────────
  @Get('tecnicas')
  tecnicas() {
    return this.catalogos.tecnicas();
  }

  @Roles(RolUsuario.ADMIN)
  @Post('tecnicas')
  crearTecnica(@Body() dto: CreateCatalogoDto) {
    return this.catalogos.crearTecnica(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch('tecnicas/:id')
  actualizarTecnica(@Param('id') id: string, @Body() dto: UpdateCatalogoDto) {
    return this.catalogos.actualizarTecnica(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete('tecnicas/:id')
  eliminarTecnica(@Param('id') id: string) {
    return this.catalogos.eliminarTecnica(id);
  }
}
