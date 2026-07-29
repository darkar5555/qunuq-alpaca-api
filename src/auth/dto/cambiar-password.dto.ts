import { IsString, MinLength } from 'class-validator';

// Para que un usuario cambie su PROPIA contraseña (verifica la actual).
export class CambiarPasswordDto {
  @IsString()
  passwordActual: string;

  @IsString()
  @MinLength(6)
  passwordNueva: string;
}
