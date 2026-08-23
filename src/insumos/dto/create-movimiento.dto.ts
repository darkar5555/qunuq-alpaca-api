import { TipoMovimiento } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMovimientoDto {
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento; // ENTRADA | SALIDA

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  cantidad: number;

  @IsOptional()
  @IsString()
  referencia?: string; // ej. "Compra proveedor X", "Uso pedido PED-0007"
}
