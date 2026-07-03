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

  // ── Contenido editable de la landing (textos iniciales) ──
  const contenido = [
    { clave: 'hero.eyebrow', grupo: 'hero', etiqueta: 'Hero · Etiqueta', tipo: 'texto', orden: 1, valor: 'Tejidos a tu medida' },
    { clave: 'hero.titulo', grupo: 'hero', etiqueta: 'Hero · Título', tipo: 'texto', orden: 2, valor: 'Tu tejido de alpaca, hecho como lo imaginas' },
    { clave: 'hero.lead', grupo: 'hero', etiqueta: 'Hero · Texto', tipo: 'multilinea', orden: 3, valor: 'Tejemos en alpaca, baby alpaca y fibras naturales. Eliges fibra, color y técnica; nosotros lo producimos en pequeños lotes, con acabado artesanal.' },
    { clave: 'about.eyebrow', grupo: 'about', etiqueta: 'Nosotros · Etiqueta', tipo: 'texto', orden: 1, valor: 'Quiénes somos' },
    { clave: 'about.titulo', grupo: 'about', etiqueta: 'Nosotros · Título', tipo: 'texto', orden: 2, valor: 'Un taller, no una fábrica' },
    { clave: 'about.parrafo1', grupo: 'about', etiqueta: 'Nosotros · Párrafo 1', tipo: 'multilinea', orden: 3, valor: 'Somos un equipo pequeño de Arequipa que teje a pedido. Eso nos permite hacer lo que las grandes no pueden: pedidos chicos, colores a medida y trato directo contigo en cada paso.' },
    { clave: 'about.parrafo2', grupo: 'about', etiqueta: 'Nosotros · Párrafo 2', tipo: 'multilinea', orden: 4, valor: 'Trabajamos con fibras nobles —alpaca, baby alpaca, pima— y cuidamos el acabado de cada pieza, porque tu marca también se siente al tacto.' },
    { clave: 'tejidos.eyebrow', grupo: 'tejidos', etiqueta: 'Qué tejemos · Etiqueta', tipo: 'texto', orden: 1, valor: 'Qué tejemos' },
    { clave: 'tejidos.titulo', grupo: 'tejidos', etiqueta: 'Qué tejemos · Título', tipo: 'texto', orden: 2, valor: 'Una sola fábrica de ideas, muchos tejidos' },
    { clave: 'tejidos.subtitulo', grupo: 'tejidos', etiqueta: 'Qué tejemos · Subtítulo', tipo: 'multilinea', orden: 3, valor: 'Desde la tela por metro hasta la prenda terminada, todo se puede personalizar.' },
    { clave: 'contacto.titulo', grupo: 'contacto', etiqueta: 'Contacto · Título', tipo: 'texto', orden: 1, valor: 'Hablemos de tu proyecto' },
    { clave: 'contacto.subtitulo', grupo: 'contacto', etiqueta: 'Contacto · Subtítulo', tipo: 'multilinea', orden: 2, valor: 'Cuéntanos qué necesitas y te enviamos una cotización sin compromiso.' },
    { clave: 'contacto.direccion', grupo: 'contacto', etiqueta: 'Contacto · Dirección', tipo: 'texto', orden: 3, valor: 'Jr. Alfonso Ugarte 112, La Tomilla, Cayma, Arequipa' },
    { clave: 'contacto.telefono', grupo: 'contacto', etiqueta: 'Contacto · Teléfono', tipo: 'texto', orden: 4, valor: '+51 993 064 492' },
    { clave: 'contacto.whatsapp', grupo: 'contacto', etiqueta: 'Contacto · WhatsApp (solo números)', tipo: 'texto', orden: 5, valor: '51993064492' },
    { clave: 'contacto.email', grupo: 'contacto', etiqueta: 'Contacto · Correo', tipo: 'texto', orden: 6, valor: 'qunuqalpaca@hotmail.com' },
    { clave: 'contacto.horario', grupo: 'contacto', etiqueta: 'Contacto · Horario', tipo: 'texto', orden: 7, valor: 'Lunes a viernes · 9:00 – 18:00' },
    { clave: 'redes.instagram', grupo: 'redes', etiqueta: 'Redes · Instagram (URL)', tipo: 'url', orden: 1, valor: '' },
    { clave: 'redes.facebook', grupo: 'redes', etiqueta: 'Redes · Facebook (URL)', tipo: 'url', orden: 2, valor: '' },
  ];
  for (const c of contenido) {
    // update vacío: no pisa lo que el usuario haya editado en el ERP.
    await prisma.contenidoSitio.upsert({
      where: { clave: c.clave },
      update: {},
      create: c,
    });
  }

  // ── Tarjetas iniciales de "Qué tejemos" ──
  if ((await prisma.tarjetaProducto.count()) === 0) {
    await prisma.tarjetaProducto.createMany({
      data: [
        { titulo: 'Telas', descripcion: 'Plano, dobby y jacquard en distintos pesos.', imagenUrl: 'https://loremflickr.com/640/480/wool,fabric?lock=31', orden: 1 },
        { titulo: 'Tejido de punto', descripcion: 'Chompas, intarsia y trenzados a galga fina.', imagenUrl: 'https://loremflickr.com/640/480/knitting,wool?lock=32', orden: 2 },
        { titulo: 'Accesorios', descripcion: 'Chalinas, gorros y estolas de tacto suave.', imagenUrl: 'https://loremflickr.com/640/480/scarf,wool?lock=33', orden: 3 },
        { titulo: 'Línea hogar', descripcion: 'Mantas, cojines y throws para abrigar.', imagenUrl: 'https://loremflickr.com/640/480/blanket,textile?lock=34', orden: 4 },
      ],
    });
  }

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
