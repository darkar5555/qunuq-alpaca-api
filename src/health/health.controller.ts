import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  // Público: el monitoreo debe poder consultarlo sin token.
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'qunuq-alpaca-api',
      timestamp: new Date().toISOString(),
    };
  }
}
