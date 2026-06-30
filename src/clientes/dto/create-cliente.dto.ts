import { TipoDocumento } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClienteDto {
  @IsEnum(TipoDocumento, { message: 'tipoDocumento debe ser DNI o RUC' })
  tipoDocumento: TipoDocumento;

  @IsString()
  @Matches(/^\d+$/, { message: 'numeroDocumento debe contener solo dígitos' })
  numeroDocumento: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombreORazonSocial: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;
}
