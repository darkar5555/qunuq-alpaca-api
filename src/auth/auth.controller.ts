import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CurrentUser,
  UsuarioAutenticado,
} from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Público: aquí se obtiene el token.
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Protegido: devuelve el usuario del token (útil para el ERP al cargar).
  @Get('me')
  me(@CurrentUser() user: UsuarioAutenticado) {
    return user;
  }

  // Cualquier usuario autenticado cambia su propia contraseña.
  @Patch('me/password')
  cambiarPassword(
    @CurrentUser() user: UsuarioAutenticado,
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.authService.cambiarPassword(user.id, dto);
  }
}
