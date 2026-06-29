import { Controller, Get } from '@nestjs/common';
import { ComprobantesService } from './comprobantes.service';

@Controller('comprobantes')
export class ComprobantesController {
  constructor(private readonly comprobantesService: ComprobantesService) {}

  @Get()
  findAll() {
    return this.comprobantesService.findAll();
  }
}
