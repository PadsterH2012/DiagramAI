-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "diagrams" ADD COLUMN     "project_id" UUID,
ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_name_idx" ON "projects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_user_id_key" ON "projects"("name", "user_id");

-- CreateIndex
CREATE INDEX "diagrams_project_id_idx" ON "diagrams"("project_id");

-- CreateIndex
CREATE INDEX "diagrams_title_idx" ON "diagrams"("title");

-- CreateIndex
CREATE INDEX "diagrams_tags_idx" ON "diagrams" USING GIN("tags");

-- CreateIndex
CREATE INDEX "diagrams_user_id_project_id_idx" ON "diagrams"("user_id", "project_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create default project for existing diagrams
DO $$
BEGIN
    -- Insert default projects for users who have diagrams but no projects
    INSERT INTO "projects" ("name", "description", "user_id") 
    SELECT 'Default Project', 'Auto-created for existing diagrams', "user_id" 
    FROM (
        SELECT DISTINCT "user_id" 
        FROM "diagrams" 
        WHERE "user_id" IS NOT NULL
    ) AS users_with_diagrams
    WHERE NOT EXISTS (
        SELECT 1 FROM "projects" WHERE "projects"."user_id" = users_with_diagrams."user_id"
    );

    -- Assign existing diagrams to default projects
    UPDATE "diagrams" 
    SET "project_id" = p."id" 
    FROM "projects" p 
    WHERE "diagrams"."user_id" = p."user_id" 
    AND p."name" = 'Default Project' 
    AND "diagrams"."project_id" IS NULL;
END $$;