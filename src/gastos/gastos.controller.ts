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
import { RolUsuario, TipoGasto } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGastoDto, UpdateGastoDto } from './dto/create-gasto.dto';
import { GastosPdfService } from './gastos-pdf.service';
import { GastosService } from './gastos.service';

// Finanzas del negocio: solo el administrador.
@Roles(RolUsuario.ADMIN)
@Controller('gastos')
export class GastosController {
  constructor(
    private readonly gastosService: GastosService,
    private readonly gastosPdf: GastosPdfService,
  ) {}

  // Resumen financiero mensual (ingresos vs egresos = utilidad).
  @Get('resumen')
  resumen(@Query('meses') meses?: string) {
    const n = Math.min(Math.max(Number(meses) || 6, 1), 24);
    return this.gastosService.resumen(n);
  }

  @Get('reporte/pdf')
  async reportePdf(
    @Res() res: Response,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('tipo') tipo?: TipoGasto,
    @Query('categoria') categoria?: string,
  ) {
    const datos = await this.gastosService.listar({
      desde,
      hasta,
      tipo,
      categoria,
    });
    const doc = this.gastosPdf.generar(datos);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-gastos.pdf"',
    });
    doc.pipe(res);
    doc.end();
  }

  @Get()
  listar(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('tipo') tipo?: TipoGasto,
    @Query('categoria') categoria?: string,
  ) {
    return this.gastosService.listar({ desde, hasta, tipo, categoria });
  }

  @Post()
  crear(@Body() dto: CreateGastoDto) {
    return this.gastosService.crear(dto);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateGastoDto) {
    return this.gastosService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.gastosService.eliminar(id);
  }
}
