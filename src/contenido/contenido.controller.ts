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
  CrearImagenDto,
} from './dto/contenido.dto';

interface ArchivoSubido {
  filename: string;
}

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
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) =>
          cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const ok = /image\/(png|jpe?g|webp|gif)/.test(file.mimetype);
        cb(ok ? null : new BadRequestException('Solo se permiten imágenes'), ok);
      },
    }),
  )
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
}
