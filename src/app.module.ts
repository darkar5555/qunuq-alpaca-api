import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProductosModule } from './productos/productos.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ComprobantesModule } from './comprobantes/comprobantes.module';
import { PagosModule } from './pagos/pagos.module';
import { InsumosModule } from './insumos/insumos.module';

@Module({
  imports: [
    // Carga el .env y expone ConfigService de forma global.
    ConfigModule.forRoot({ isGlobal: true }),

    // Infraestructura.
    PrismaModule,
    HealthModule,

    // Un módulo por dominio.
    UsuariosModule,
    ClientesModule,
    ProductosModule,
    CatalogosModule,
    PedidosModule,
    ComprobantesModule,
    PagosModule,
    InsumosModule,
  ],
})
export class AppModule {}
