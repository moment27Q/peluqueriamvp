-- AlterTable: add login_attempts and locked_until to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMP(3);
