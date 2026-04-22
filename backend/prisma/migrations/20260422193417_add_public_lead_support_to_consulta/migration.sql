-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "emailContacto" TEXT,
ADD COLUMN     "nombreContacto" TEXT,
ADD COLUMN     "origen" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "telefonoContacto" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Consulta_origen_createdAt_idx" ON "Consulta"("origen", "createdAt");
