import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ActualizarContenidoDto {
  @IsString()
  @MaxLength(2000)
  valor: string;
}

export class CrearImagenDto {
  @IsString()
  @MinLength(2)
  seccion: string; // hero | galeria | producto

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;
}

export class ActualizarImagenDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  // Los campos vienen como texto en multipart/query; los convertimos.
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  orden?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  activo?: boolean;
}

export class CrearTarjetaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  titulo: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  descripcion: string;
}

export class ActualizarTarjetaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  descripcion?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  orden?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  activo?: boolean;
}
