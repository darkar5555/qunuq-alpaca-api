import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CATEGORIAS } from './create-producto.dto';

// Todos los campos opcionales: se actualiza solo lo que venga.
export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsIn(CATEGORIAS, {
    message: 'categoria debe ser: tela, punto, accesorio u hogar',
  })
  categoria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'precioBase debe ser un número' })
  @Min(0, { message: 'precioBase no puede ser negativo' })
  precioBase?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidad?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
