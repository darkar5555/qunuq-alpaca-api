import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

// Restringe una ruta (o un controlador entero) a ciertos roles.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
