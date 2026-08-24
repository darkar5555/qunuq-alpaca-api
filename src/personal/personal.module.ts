import { Module } from '@nestjs/common';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';
import { ReportePdfService } from './reporte-pdf.service';

@Module({
  controllers: [PersonalController],
  providers: [PersonalService, ReportePdfService],
})
export class PersonalModule {}
