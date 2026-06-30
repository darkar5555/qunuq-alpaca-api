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

// Categorías del catálogo (las mismas del configurador de la landing).
export const CATEGORIAS = ['tela', 'punto', 'accesorio', 'hogar'] as const;

export class CreateProductoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre: string;

  @IsIn(CATEGORIAS, {
    message: 'categoria debe ser: tela, punto, accesorio u hogar',
  })
  categoria: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'precioBase debe ser un número' })
  @Min(0, { message: 'precioBase no puede ser negativo' })
  precioBase: number;

  @IsString()
  @MaxLength(20)
  unidad: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
