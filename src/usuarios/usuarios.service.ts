import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// Campos seguros para devolver al exterior (nunca el passwordHash).
const PUBLIC_FIELDS = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
} satisfies Prisma.UsuarioSelect;

const SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        rol: dto.rol,
      },
      select: PUBLIC_FIELDS,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: PUBLIC_FIELDS,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: PUBLIC_FIELDS,
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  // Uso interno (login): incluye passwordHash. No exponer por la API.
  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const { password, ...resto } = dto;
    const data: Prisma.UsuarioUpdateInput = { ...resto };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: PUBLIC_FIELDS,
    });
  }

  // Cambio de la propia contraseña: exige y verifica la contraseña actual.
  async cambiarPassword(id: string, actual: string, nueva: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ok = await bcrypt.compare(actual, usuario.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const passwordHash = await bcrypt.hash(nueva, SALT_ROUNDS);
    await this.prisma.usuario.update({
      where: { id },
      data: { passwordHash },
    });
    return { mensaje: 'Contraseña actualizada' };
  }

  // Baja lógica: desactivamos en vez de borrar (preserva el historial).
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: PUBLIC_FIELDS,
    });
  }
}
