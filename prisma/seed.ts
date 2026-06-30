import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de ejemplo...');

  // ── Usuario administrador (para poder hacer login) ─────
  const adminEmail = 'admin@qunuqalpaca.com';
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nombre: 'Administrador',
      email: adminEmail,
      passwordHash: await bcrypt.hash('admin123', 10),
      rol: 'ADMIN',
    },
  });

  // ── Catálogos del configurador "Diseña tu tejido" ──────
  const fibras = [
    'Alpaca Baby',
    'Alpaca Suri',
    'Alpaca Huacaya',
    'Alpaca Royal',
    'Mezcla Alpaca-Algodón',
  ];

  const colores = [
    { nombre: 'Natural / Crudo', hex: '#E8E0D5' },
    { nombre: 'Marrón Vicuña', hex: '#6F4E37' },
    { nombre: 'Gris Plata', hex: '#9CA3AF' },
    { nombre: 'Negro', hex: '#1F2937' },
    { nombre: 'Rojo Granate', hex: '#7B1E2B' },
    { nombre: 'Azul Índigo', hex: '#2C3E66' },
  ];

  const tecnicas = [
    'Tejido a telar',
    'Punto a mano',
    'Punto a máquina',
    'Crochet',
    'Bordado andino',
  ];

  // upsert = crea si no existe, no duplica al volver a correr el seed.
  for (const nombre of fibras) {
    await prisma.fibra.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  for (const c of colores) {
    await prisma.color.upsert({
      where: { nombre: c.nombre },
      update: { hex: c.hex },
      create: c,
    });
  }
  for (const nombre of tecnicas) {
    await prisma.tecnica.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }

  // ── Productos de ejemplo ───────────────────────────────
  if ((await prisma.producto.count()) === 0) {
    await prisma.producto.createMany({
      data: [
        {
          nombre: 'Tela de alpaca',
          categoria: 'tela',
          descripcion: 'Tela 100% alpaca tejida a telar, por metro lineal.',
          precioBase: 120.0,
          unidad: 'metro',
        },
        {
          nombre: 'Chal de alpaca',
          categoria: 'accesorio',
          descripcion: 'Chal tejido a mano, suave y abrigador.',
          precioBase: 150.0,
          unidad: 'unidad',
        },
        {
          nombre: 'Chompa de punto',
          categoria: 'punto',
          descripcion: 'Chompa de punto en alpaca, diseño personalizable.',
          precioBase: 220.0,
          unidad: 'unidad',
        },
        {
          nombre: 'Gorro andino',
          categoria: 'accesorio',
          descripcion: 'Gorro con motivos andinos.',
          precioBase: 45.0,
          unidad: 'unidad',
        },
        {
          nombre: 'Manta para hogar',
          categoria: 'hogar',
          descripcion: 'Manta/frazada de alpaca para cama o sofá.',
          precioBase: 280.0,
          unidad: 'unidad',
        },
        {
          nombre: 'Bufanda',
          categoria: 'accesorio',
          descripcion: 'Bufanda de alpaca, varios colores.',
          precioBase: 70.0,
          unidad: 'unidad',
        },
      ],
    });
  }

  // ── Cliente de ejemplo ─────────────────────────────────
  await prisma.cliente.upsert({
    where: {
      tipoDocumento_numeroDocumento: {
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
      },
    },
    update: {},
    create: {
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      nombreORazonSocial: 'Cliente de Ejemplo',
      email: 'cliente@ejemplo.com',
      telefono: '+51 999 999 999',
      direccion: 'Arequipa, Perú',
    },
  });

  // Conteos finales
  const [nFibras, nColores, nTecnicas, nProductos, nClientes] = await Promise.all([
    prisma.fibra.count(),
    prisma.color.count(),
    prisma.tecnica.count(),
    prisma.producto.count(),
    prisma.cliente.count(),
  ]);

  console.log('✅ Seed completado:');
  console.log(`   Fibras: ${nFibras} · Colores: ${nColores} · Técnicas: ${nTecnicas}`);
  console.log(`   Productos: ${nProductos} · Clientes: ${nClientes}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
