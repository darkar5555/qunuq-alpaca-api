import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTrabajadorDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsString()
  @MinLength(2)
  oficio: string; // tejedora, hilandera, acabados...

  @IsOptional()
  @IsString()
  fechaIngreso?: string; // ISO (YYYY-MM-DD)

  @IsOptional()
  @IsString()
  notas?: string;
}

// Igual que crear, pero todo opcional y permite activar/desactivar.
export class UpdateTrabajadorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  oficio?: string;

  @IsOptional()
  @IsString()
  fechaIngreso?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
