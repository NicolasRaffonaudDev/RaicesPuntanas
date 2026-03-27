-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "Amenity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmenityToLote" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AmenityToLote_AB_unique" ON "_AmenityToLote"("A", "B");

-- CreateIndex
CREATE INDEX "_AmenityToLote_B_index" ON "_AmenityToLote"("B");

-- AddForeignKey
ALTER TABLE "_AmenityToLote" ADD CONSTRAINT "_AmenityToLote_A_fkey" FOREIGN KEY ("A") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToLote" ADD CONSTRAINT "_AmenityToLote_B_fkey" FOREIGN KEY ("B") REFERENCES "Lote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: migrate existing amenities arrays into Amenity + join table
INSERT INTO "Amenity" ("id", "name")
SELECT gen_random_uuid(), amenity
FROM (
    SELECT DISTINCT unnest("amenities") AS amenity
    FROM "Lote"
    WHERE "amenities" IS NOT NULL
) AS src
WHERE amenity IS NOT NULL AND amenity <> '';

INSERT INTO "_AmenityToLote" ("A", "B")
SELECT a."id", l."id"
FROM "Lote" l
JOIN LATERAL unnest(l."amenities") AS amenity(name) ON TRUE
JOIN "Amenity" a ON a."name" = amenity.name;

-- DropColumn
ALTER TABLE "Lote" DROP COLUMN "amenities";
