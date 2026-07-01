import { Controller, Get, Query } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

// Datos de ventas: solo admin y ventas.
@Roles(RolUsuario.ADMIN, RolUsuario.VENTAS)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('resumen')
  resumen() {
    return this.dashboard.resumen();
  }

  @Get('ventas-por-mes')
  ventasPorMes(@Query('meses') meses?: string) {
    // Por defecto 6 meses; acotado entre 1 y 24.
    const n = Math.min(Math.max(parseInt(meses ?? '6', 10) || 6, 1), 24);
    return this.dashboard.ventasPorMes(n);
  }
}
