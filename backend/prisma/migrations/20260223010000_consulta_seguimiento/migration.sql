-- CreateTable
CREATE TABLE "ConsultaSeguimiento" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "autorId" TEXT,
    "mensaje" TEXT NOT NULL,
    "esInterno" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultaSeguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsultaSeguimiento_consultaId_createdAt_idx" ON "ConsultaSeguimiento"("consultaId", "createdAt");

-- CreateIndex
CREATE INDEX "ConsultaSeguimiento_autorId_createdAt_idx" ON "ConsultaSeguimiento"("autorId", "createdAt");

-- AddForeignKey
ALTER TABLE "ConsultaSeguimiento" ADD CONSTRAINT "ConsultaSeguimiento_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultaSeguimiento" ADD CONSTRAINT "ConsultaSeguimiento_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
