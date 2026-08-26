import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProductosModule } from './productos/productos.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ContenidoModule } from './contenido/contenido.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { ComprobantesModule } from './comprobantes/comprobantes.module';
import { PagosModule } from './pagos/pagos.module';
import { InsumosModule } from './insumos/insumos.module';
import { PersonalModule } from './personal/personal.module';
import { GastosModule } from './gastos/gastos.module';

@Module({
  imports: [
    // Carga el .env y expone ConfigService de forma global.
    ConfigModule.forRoot({ isGlobal: true }),

    // Límite anti-spam por defecto (se aplica al endpoint público de solicitudes).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),

    // Infraestructura.
    PrismaModule,
    HealthModule,
    AuthModule,

    // Un módulo por dominio.
    UsuariosModule,
    ClientesModule,
    ProductosModule,
    CatalogosModule,
    PedidosModule,
    DashboardModule,
    ContenidoModule,
    SolicitudesModule,
    ComprobantesModule,
    PagosModule,
    InsumosModule,
    PersonalModule,
    GastosModule,
  ],
  providers: [
    // Guards globales: 1) exige token JWT, 2) verifica el rol.
    // Toda la API queda protegida salvo lo marcado con @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
