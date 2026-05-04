-- Add prioridad to consultas with a safe default for existing rows.
ALTER TABLE "Consulta"
ADD COLUMN "prioridad" TEXT NOT NULL DEFAULT 'media';

CREATE INDEX "Consulta_prioridad_createdAt_idx" ON "Consulta"("prioridad", "createdAt");
