import { EstadoSolicitud } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearSolicitudDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  interes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensaje?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  diseno?: string;

  @IsOptional()
  @IsIn(['formulario', 'configurador'])
  origen?: string;
}

export class CambiarEstadoSolicitudDto {
  @IsEnum(EstadoSolicitud, {
    message: 'estado debe ser NUEVA, ATENDIDA, CONVERTIDA o DESCARTADA',
  })
  estado: EstadoSolicitud;
}
