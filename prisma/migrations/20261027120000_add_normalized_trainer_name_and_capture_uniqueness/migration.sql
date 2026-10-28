-- Normalize existing trainer names before enforcing the new public-name contract.
ALTER TABLE "trainers" ADD COLUMN "nameNormalized" TEXT NOT NULL DEFAULT '';

UPDATE "trainers"
SET "nameNormalized" = lower(btrim("name"));

ALTER TABLE "trainers" ALTER COLUMN "nameNormalized" DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "trainers"
    GROUP BY "nameNormalized"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce unique normalized trainer names without resolving existing duplicates';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "captures"
    GROUP BY "trainerId", "pokeApiId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce unique trainer and Pokemon captures without resolving existing duplicates';
  END IF;
END $$;

CREATE UNIQUE INDEX "trainers_nameNormalized_key"
ON "trainers"("nameNormalized");

CREATE UNIQUE INDEX "captures_trainerId_pokeApiId_key"
ON "captures"("trainerId", "pokeApiId");
