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
import { RolUsuario } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateTrabajadorDto,
  UpdateTrabajadorDto,
} from './dto/create-trabajador.dto';
import { CreatePagoPersonalDto } from './dto/create-pago-personal.dto';
import { PersonalService } from './personal.service';
import { ReportePdfService } from './reporte-pdf.service';

// Personal y sus pagos: información sensible → solo ADMIN y PRODUCCION.
@Roles(RolUsuario.ADMIN, RolUsuario.PRODUCCION)
@Controller('personal')
export class PersonalController {
  constructor(
    private readonly personalService: PersonalService,
    private readonly reportePdf: ReportePdfService,
  ) {}

  // ── Reporte (antes de :id para que la ruta no choque) ──

  @Get('reporte')
  reporte(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('trabajadorId') trabajadorId?: string,
  ) {
    return this.personalService.reporte({ desde, hasta, trabajadorId });
  }

  @Get('reporte/pdf')
  async reportePdfDescarga(
    @Res() res: Response,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('trabajadorId') trabajadorId?: string,
  ) {
    const datos = await this.personalService.reporte({
      desde,
      hasta,
      trabajadorId,
    });
    const doc = this.reportePdf.generar(datos);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-pagos-personal.pdf"',
    });
    doc.pipe(res);
    doc.end();
  }

  // ── Pagos ──

  @Post(':id/pagos')
  registrarPago(@Param('id') id: string, @Body() dto: CreatePagoPersonalDto) {
    return this.personalService.registrarPago(id, dto);
  }

  // Anular un pago: solo admin.
  @Roles(RolUsuario.ADMIN)
  @Delete('pagos/:pagoId')
  anularPago(@Param('pagoId') pagoId: string) {
    return this.personalService.anularPago(pagoId);
  }

  // ── Trabajadores ──

  @Get()
  listar() {
    return this.personalService.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.personalService.obtener(id);
  }

  @Post()
  crear(@Body() dto: CreateTrabajadorDto) {
    return this.personalService.crear(dto);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateTrabajadorDto) {
    return this.personalService.actualizar(id, dto);
  }

  // Baja lógica (desactivar): solo admin.
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  desactivar(@Param('id') id: string) {
    return this.personalService.desactivar(id);
  }
}
