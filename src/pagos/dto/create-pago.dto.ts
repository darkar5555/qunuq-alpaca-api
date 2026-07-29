import { MetodoPago } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePagoDto {
  @IsString()
  pedidoId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto: number;

  @IsEnum(MetodoPago)
  metodo: MetodoPago;

  // Fecha opcional (ISO). Si no viene, la API usa la fecha actual.
  @IsOptional()
  @IsString()
  fecha?: string;
}
