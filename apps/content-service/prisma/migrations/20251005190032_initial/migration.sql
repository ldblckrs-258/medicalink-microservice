-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "content";

-- CreateEnum
CREATE TYPE "content"."QuestionStatus" AS ENUM ('PENDING', 'ANSWERED', 'CLOSED');

-- CreateEnum
CREATE TYPE "content"."PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "content"."blog_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."blogs" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "content" TEXT NOT NULL,
    "category_id" VARCHAR(27) NOT NULL,
    "author_id" VARCHAR(27) NOT NULL,
    "status" "content"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."questions" (
    "id" TEXT NOT NULL,
    "author_name" VARCHAR(120) NOT NULL DEFAULT 'Anonymous',
    "author_email" VARCHAR(120),
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "content"."QuestionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."answers" (
    "id" TEXT NOT NULL,
    "question_id" VARCHAR(27) NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "body" TEXT NOT NULL,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."reviews" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "author_name" VARCHAR(120) NOT NULL DEFAULT 'Anonymous',
    "author_email" VARCHAR(120),
    "rating" SMALLINT NOT NULL,
    "title" VARCHAR(160),
    "body" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "content"."blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "content"."blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "content"."blogs"("slug");

-- CreateIndex
CREATE INDEX "idx_answers_question" ON "content"."answers"("question_id");

-- CreateIndex
CREATE INDEX "idx_answers_doctor_created" ON "content"."answers"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_reviews_doctor" ON "content"."reviews"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_reviews_rating" ON "content"."reviews"("rating");

-- AddForeignKey
ALTER TABLE "content"."blogs" ADD CONSTRAINT "blogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "content"."blog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "content"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
