-- CreateTable
CREATE TABLE "LoteFavorito" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoteFavorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loteId" INTEGER,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoteFavorito_userId_loteId_key" ON "LoteFavorito"("userId", "loteId");

-- CreateIndex
CREATE INDEX "LoteFavorito_userId_createdAt_idx" ON "LoteFavorito"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Consulta_userId_createdAt_idx" ON "Consulta"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Consulta_estado_createdAt_idx" ON "Consulta"("estado", "createdAt");

-- AddForeignKey
ALTER TABLE "LoteFavorito" ADD CONSTRAINT "LoteFavorito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteFavorito" ADD CONSTRAINT "LoteFavorito_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;