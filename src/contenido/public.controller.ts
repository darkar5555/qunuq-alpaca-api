import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ContenidoService } from './contenido.service';

// Endpoints SIN autenticación que consume la landing pública.
@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly contenido: ContenidoService) {}

  // Catálogo para el configurador "Diseña tu tejido".
  @Get('catalogo')
  catalogo() {
    return this.contenido.catalogoPublico();
  }

  // Textos editables como mapa { clave: valor }.
  @Get('contenido')
  textos() {
    return this.contenido.mapaContenido();
  }

  // Imágenes activas (opcionalmente filtradas por sección).
  @Get('imagenes')
  imagenes(@Query('seccion') seccion?: string) {
    return this.contenido.listarImagenesPublicas(seccion);
  }

  // Tarjetas activas de "Qué tejemos".
  @Get('tarjetas')
  tarjetas() {
    return this.contenido.listarTarjetasPublicas();
  }
}
