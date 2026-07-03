-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('NUEVA', 'ATENDIDA', 'CONVERTIDA', 'DESCARTADA');

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "interes" TEXT,
    "mensaje" TEXT,
    "diseno" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'formulario',
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'NUEVA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);
