import {
  IsBoolean,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Fibra y Técnica: solo nombre.
export class CreateCatalogoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre: string;
}

export class UpdateCatalogoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// Color: nombre + código hex opcional.
export class CreateColorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre: string;

  @IsOptional()
  @IsHexColor({ message: 'hex debe ser un color hexadecimal, p. ej. #1F2937' })
  hex?: string;
}

export class UpdateColorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre?: string;

  @IsOptional()
  @IsHexColor({ message: 'hex debe ser un color hexadecimal, p. ej. #1F2937' })
  hex?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
