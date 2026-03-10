ALTER TABLE "subscription_plans"
ADD COLUMN IF NOT EXISTS "max_employees" INTEGER;
