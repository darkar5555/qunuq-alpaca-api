import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global: cualquier módulo puede inyectar PrismaService sin reimportarlo.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
