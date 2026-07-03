import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolUsuario } from '@prisma/client';
import { diskStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContenidoService } from './contenido.service';
import {
  ActualizarContenidoDto,
  ActualizarImagenDto,
  ActualizarTarjetaDto,
  CrearImagenDto,
  CrearTarjetaDto,
} from './dto/contenido.dto';

interface ArchivoSubido {
  filename: string;
}

// Configuración compartida de subida de imágenes (guardado local).
const ALMACENAMIENTO_IMAGENES = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) =>
      cb(null, `${randomUUID()}${extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    cb: (error: Error | null, aceptar: boolean) => void,
  ) => {
    const ok = /image\/(png|jpe?g|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new BadRequestException('Solo se permiten imágenes'), ok);
  },
};

// Gestión del contenido del sitio desde el ERP. Solo administradores.
@Roles(RolUsuario.ADMIN)
@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenido: ContenidoService) {}

  // ── Textos ──
  @Get()
  listar() {
    return this.contenido.listarContenido();
  }

  @Patch(':clave')
  actualizar(
    @Param('clave') clave: string,
    @Body() dto: ActualizarContenidoDto,
  ) {
    return this.contenido.actualizarContenido(clave, dto.valor);
  }

  // ── Imágenes ──
  @Get('imagenes/todas')
  listarImagenes(@Query('seccion') seccion?: string) {
    return this.contenido.listarImagenes(seccion);
  }

  @Post('imagenes')
  @UseInterceptors(FileInterceptor('archivo', ALMACENAMIENTO_IMAGENES))
  subirImagen(
    @UploadedFile() archivo: ArchivoSubido | undefined,
    @Body() dto: CrearImagenDto,
  ) {
    if (!archivo) {
      throw new BadRequestException('Falta el archivo de imagen');
    }
    return this.contenido.crearImagen({
      seccion: dto.seccion,
      titulo: dto.titulo,
      url: `/uploads/${archivo.filename}`,
    });
  }

  @Patch('imagenes/:id')
  actualizarImagen(
    @Param('id') id: string,
    @Body() dto: ActualizarImagenDto,
  ) {
    return this.contenido.actualizarImagen(id, dto);
  }

  @Delete('imagenes/:id')
  eliminarImagen(@Param('id') id: string) {
    return this.contenido.eliminarImagen(id);
  }

  // ── Tarjetas "Qué tejemos" ──
  @Get('tarjetas')
  listarTarjetas() {
    return this.contenido.listarTarjetas();
  }

  @Post('tarjetas')
  crearTarjeta(@Body() dto: CrearTarjetaDto) {
    return this.contenido.crearTarjeta(dto);
  }

  @Patch('tarjetas/:id')
  actualizarTarjeta(
    @Param('id') id: string,
    @Body() dto: ActualizarTarjetaDto,
  ) {
    return this.contenido.actualizarTarjeta(id, dto);
  }

  @Post('tarjetas/:id/imagen')
  @UseInterceptors(FileInterceptor('archivo', ALMACENAMIENTO_IMAGENES))
  subirImagenTarjeta(
    @Param('id') id: string,
    @UploadedFile() archivo: ArchivoSubido | undefined,
  ) {
    if (!archivo) {
      throw new BadRequestException('Falta el archivo de imagen');
    }
    return this.contenido.setImagenTarjeta(id, `/uploads/${archivo.filename}`);
  }

  @Delete('tarjetas/:id')
  eliminarTarjeta(@Param('id') id: string) {
    return this.contenido.eliminarTarjeta(id);
  }
}
