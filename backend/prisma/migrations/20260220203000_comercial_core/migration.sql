-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('entrada', 'salida', 'ajuste');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaItem" (
    "id" SERIAL NOT NULL,
    "ventaId" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnit" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "VentaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioMovimiento" (
    "id" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,
    "userId" TEXT,
    "tipo" "StockMovementType" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- CreateIndex
CREATE INDEX "Venta_userId_createdAt_idx" ON "Venta"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Venta_clienteId_createdAt_idx" ON "Venta"("clienteId", "createdAt");

-- CreateIndex
CREATE INDEX "InventarioMovimiento_productoId_createdAt_idx" ON "InventarioMovimiento"("productoId", "createdAt");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;