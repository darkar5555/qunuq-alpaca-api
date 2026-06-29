import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogos: CatalogosService) {}

  @Get('fibras')
  fibras() {
    return this.catalogos.fibras();
  }

  @Get('colores')
  colores() {
    return this.catalogos.colores();
  }

  @Get('tecnicas')
  tecnicas() {
    return this.catalogos.tecnicas();
  }
}
