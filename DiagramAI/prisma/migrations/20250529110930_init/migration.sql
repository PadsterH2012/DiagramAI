-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "display_name" VARCHAR(150),
    "avatar_url" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "bio" TEXT,
    "location" VARCHAR(100),
    "website_url" TEXT,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "language_preference" VARCHAR(10) NOT NULL DEFAULT 'en',
    "theme_preference" VARCHAR(20) NOT NULL DEFAULT 'light',
    "notification_preferences" JSONB NOT NULL DEFAULT '{}',
    "privacy_settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "refresh_token" VARCHAR(255),
    "device_info" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" JSONB NOT NULL,
    "setting_type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagrams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "template_category" VARCHAR(50),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "fork_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "diagram_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "change_summary" VARCHAR(500),
    "change_type" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "parent_version_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagram_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_collaborators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "diagram_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "permission_level" VARCHAR(20) NOT NULL,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_comment" BOOLEAN NOT NULL DEFAULT true,
    "can_share" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "invited_by" UUID NOT NULL,
    "invited_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',

    CONSTRAINT "diagram_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "diagram_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "content" TEXT NOT NULL,
    "content_type" VARCHAR(20) NOT NULL DEFAULT 'text',
    "position_data" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagram_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refresh_token_key" ON "user_sessions"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "application_settings_setting_key_key" ON "application_settings"("setting_key");

-- CreateIndex
CREATE UNIQUE INDEX "diagram_versions_diagram_id_version_number_key" ON "diagram_versions"("diagram_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "diagram_collaborators_diagram_id_user_id_key" ON "diagram_collaborators"("diagram_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_versions" ADD CONSTRAINT "diagram_versions_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_versions" ADD CONSTRAINT "diagram_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_versions" ADD CONSTRAINT "diagram_versions_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "diagram_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_collaborators" ADD CONSTRAINT "diagram_collaborators_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_collaborators" ADD CONSTRAINT "diagram_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_collaborators" ADD CONSTRAINT "diagram_collaborators_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_comments" ADD CONSTRAINT "diagram_comments_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_comments" ADD CONSTRAINT "diagram_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_comments" ADD CONSTRAINT "diagram_comments_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_comments" ADD CONSTRAINT "diagram_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "diagram_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
