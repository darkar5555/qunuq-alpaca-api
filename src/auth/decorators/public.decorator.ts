import { SetMetadata } from '@nestjs/common';

// Marca una ruta como pública (sin token). Ej.: login, health.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
