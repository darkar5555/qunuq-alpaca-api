import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

// Solo metadatos. El stockActual NO se edita aquí: cambia por movimientos.
export class UpdateInsumoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  unidad?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stockMinimo?: number;
}
