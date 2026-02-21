-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "createdByUserId" TEXT;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN "createdByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Cliente_createdByUserId_createdAt_idx" ON "Cliente"("createdByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Producto_createdByUserId_createdAt_idx" ON "Producto"("createdByUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;