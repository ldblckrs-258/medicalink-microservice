-- CreateEnum
CREATE TYPE "accounts"."PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "accounts"."permissions" (
    "id" TEXT NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts"."user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "permission_id" VARCHAR(27) NOT NULL,
    "effect" "accounts"."PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "tenant_id" VARCHAR(27),
    "conditions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts"."groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "tenant_id" VARCHAR(27),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts"."user_groups" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "group_id" VARCHAR(27) NOT NULL,
    "tenant_id" VARCHAR(27),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts"."group_permissions" (
    "id" TEXT NOT NULL,
    "group_id" VARCHAR(27) NOT NULL,
    "permission_id" VARCHAR(27) NOT NULL,
    "effect" "accounts"."PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "conditions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts"."auth_versions" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_permissions_resource" ON "accounts"."permissions"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "accounts"."permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "idx_user_permissions_user" ON "accounts"."user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_permissions_tenant" ON "accounts"."user_permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_tenant_id_key" ON "accounts"."user_permissions"("user_id", "permission_id", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_groups_tenant" ON "accounts"."groups"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_tenant_id_key" ON "accounts"."groups"("name", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_user" ON "accounts"."user_groups"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_group" ON "accounts"."user_groups"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_user_id_group_id_tenant_id_key" ON "accounts"."user_groups"("user_id", "group_id", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_group_permissions_group" ON "accounts"."group_permissions"("group_id");

-- CreateIndex
CREATE INDEX "idx_group_permissions_permission" ON "accounts"."group_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_permissions_group_id_permission_id_key" ON "accounts"."group_permissions"("group_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_versions_user_id_key" ON "accounts"."auth_versions"("user_id");

-- CreateIndex
CREATE INDEX "idx_auth_versions_user" ON "accounts"."auth_versions"("user_id");
