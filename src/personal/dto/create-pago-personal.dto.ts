import { MetodoPago } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePagoPersonalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto: number;

  @IsEnum(MetodoPago)
  metodo: MetodoPago;

  @IsString()
  @MinLength(2)
  concepto: string; // "Semana 18-24 ago", "Adelanto", "3 chompas PED-0012"...

  @IsOptional()
  @IsString()
  fecha?: string; // ISO; si no viene, hoy

  // Opcional: asociar el pago a un pedido (costo de mano de obra).
  @IsOptional()
  @IsString()
  pedidoId?: string;
}
