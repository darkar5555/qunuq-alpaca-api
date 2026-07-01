import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePedidoItemDto {
  @IsUUID(undefined, { message: 'productoId debe ser un UUID válido' })
  productoId: string;

  @IsOptional()
  @IsUUID()
  fibraId?: string;

  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsOptional()
  @IsUUID()
  tecnicaId?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'cantidad debe ser un número' })
  @IsPositive({ message: 'cantidad debe ser mayor que 0' })
  cantidad: number;

  // Opcional: si no se envía, se usa el precio base del producto.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario?: number;
}

export class CreatePedidoDto {
  @IsUUID(undefined, { message: 'clienteId debe ser un UUID válido' })
  clienteId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe tener al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  items: CreatePedidoItemDto[];
}
