import { EstadoPedido } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

// Edición ligera del pedido (por ahora, solo las notas).
export class UpdatePedidoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}

// Cambio de estado (endpoint aparte).
export class UpdateEstadoDto {
  @IsEnum(EstadoPedido, {
    message: 'estado debe ser: COTIZACION, MUESTRA, PRODUCCION o ENTREGADO',
  })
  estado: EstadoPedido;
}
