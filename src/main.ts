import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // CORS: orígenes permitidos (ERP y landing) definidos en CORS_ORIGIN.
  const origins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length > 0 ? origins : true,
    credentials: true,
  });

  // Sirve las imágenes subidas en /uploads (almacenamiento local).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Validación automática de los DTOs en toda la app.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`API Qunuq Alpaca escuchando en http://localhost:${port}`);
}

void bootstrap();
