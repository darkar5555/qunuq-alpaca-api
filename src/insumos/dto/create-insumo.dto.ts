import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateInsumoDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(1)
  tipo: string; // fibra, hilo, etc.

  @IsString()
  @MinLength(1)
  unidad: string; // kg, conos, etc.

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stockMinimo?: number;

  // Stock inicial opcional: se registra como una ENTRADA "Stock inicial".
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stockInicial?: number;
}
