-- AddColumn
ALTER TABLE "Pipeline" ADD COLUMN "defaultKey" TEXT;

-- Backfill canonical default pipeline and demote duplicates
WITH ranked_defaults AS (
    SELECT "id",
           ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS rn
    FROM "Pipeline"
    WHERE "isDefault" = true
)
UPDATE "Pipeline" AS p
SET "defaultKey" = 'default'
FROM ranked_defaults rd
WHERE p."id" = rd."id"
  AND rd.rn = 1;

WITH ranked_defaults AS (
    SELECT "id",
           ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS rn
    FROM "Pipeline"
    WHERE "isDefault" = true
)
UPDATE "Pipeline" AS p
SET "isDefault" = false
FROM ranked_defaults rd
WHERE p."id" = rd."id"
  AND rd.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_defaultKey_key" ON "Pipeline"("defaultKey");
