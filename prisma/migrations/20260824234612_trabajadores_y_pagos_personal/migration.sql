-- CreateTable
CREATE TABLE "trabajadores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero_documento" TEXT,
    "telefono" TEXT,
    "oficio" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_ingreso" TIMESTAMP(3),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trabajadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_personal" (
    "id" TEXT NOT NULL,
    "trabajador_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "concepto" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_personal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pagos_personal" ADD CONSTRAINT "pagos_personal_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_personal" ADD CONSTRAINT "pagos_personal_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
