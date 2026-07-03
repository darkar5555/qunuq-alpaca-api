-- CreateTable
CREATE TABLE "contenido_sitio" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'texto',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenido_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_sitio" (
    "id" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titulo" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contenido_sitio_clave_key" ON "contenido_sitio"("clave");
