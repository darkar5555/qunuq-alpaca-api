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
