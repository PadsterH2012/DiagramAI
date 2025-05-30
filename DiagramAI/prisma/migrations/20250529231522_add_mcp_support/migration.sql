/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `diagrams` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "diagrams" ADD COLUMN     "agent_accessible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "agent_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" VARCHAR(100) NOT NULL,
    "api_key_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_operations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" VARCHAR(100) NOT NULL,
    "diagram_uuid" UUID NOT NULL,
    "operation" VARCHAR(50) NOT NULL,
    "operation_data" JSONB NOT NULL,
    "result" JSONB,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "duration" INTEGER,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_credentials_agent_id_key" ON "agent_credentials"("agent_id");

-- CreateIndex
CREATE INDEX "agent_operations_diagram_uuid_idx" ON "agent_operations"("diagram_uuid");

-- CreateIndex
CREATE INDEX "agent_operations_agent_id_idx" ON "agent_operations"("agent_id");

-- CreateIndex
CREATE INDEX "agent_operations_timestamp_idx" ON "agent_operations"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "diagrams_uuid_key" ON "diagrams"("uuid");

-- AddForeignKey
ALTER TABLE "agent_operations" ADD CONSTRAINT "agent_operations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent_credentials"("agent_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_operations" ADD CONSTRAINT "agent_operations_diagram_uuid_fkey" FOREIGN KEY ("diagram_uuid") REFERENCES "diagrams"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
