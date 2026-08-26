import { MetodoPago, TipoGasto } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateGastoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto: number;

  @IsEnum(MetodoPago)
  metodo: MetodoPago;

  @IsEnum(TipoGasto)
  tipo: TipoGasto; // FIJO ("pasivo") | VARIABLE ("activo")

  @IsString()
  @MinLength(2)
  categoria: string;

  @IsString()
  @MinLength(2)
  descripcion: string;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  fecha?: string; // ISO; si no viene, hoy
}

export class UpdateGastoDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto?: number;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodo?: MetodoPago;

  @IsOptional()
  @IsEnum(TipoGasto)
  tipo?: TipoGasto;

  @IsOptional()
  @IsString()
  @MinLength(2)
  categoria?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  descripcion?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  fecha?: string;
}
