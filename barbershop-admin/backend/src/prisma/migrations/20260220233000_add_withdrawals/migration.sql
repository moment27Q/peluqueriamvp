-- CreateEnum
CREATE TYPE "withdrawal_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "operation_number" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "withdrawal_status" NOT NULL DEFAULT 'PENDING',
    "account_holder" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "masked_account_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_operation_number_key" ON "withdrawals"("operation_number");

-- CreateIndex
CREATE INDEX "withdrawals_employee_id_idx" ON "withdrawals"("employee_id");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "withdrawals_created_at_idx" ON "withdrawals"("created_at");

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
