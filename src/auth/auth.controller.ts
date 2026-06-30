import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CurrentUser,
  UsuarioAutenticado,
} from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
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
}
