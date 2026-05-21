CREATE TABLE "LoteImagen" (
  "id" SERIAL NOT NULL,
  "loteId" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LoteImagen_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LoteImagen"
ADD CONSTRAINT "LoteImagen_loteId_fkey"
FOREIGN KEY ("loteId") REFERENCES "Lote"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "LoteImagen_loteId_createdAt_idx" ON "LoteImagen"("loteId", "createdAt");
CREATE UNIQUE INDEX "LoteImagen_loteId_orden_key" ON "LoteImagen"("loteId", "orden");

INSERT INTO "LoteImagen" ("loteId", "url", "orden", "createdAt")
SELECT "id", "image", 0, CURRENT_TIMESTAMP
FROM "Lote"
WHERE COALESCE(TRIM("image"), '') <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM "LoteImagen"
    WHERE "LoteImagen"."loteId" = "Lote"."id"
      AND "LoteImagen"."orden" = 0
  );
