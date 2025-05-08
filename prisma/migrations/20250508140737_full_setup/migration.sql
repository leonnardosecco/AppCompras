-- AlterTable
ALTER TABLE "PurchaseInstallment" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PurchaseRequestItem" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ServiceItem" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ServiceInstallment" (
    "id" TEXT NOT NULL,
    "serviceSaleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "account" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "description" TEXT,
    "nfEmission" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "receipt" TIMESTAMP(3),
    "grossValue" DOUBLE PRECISION NOT NULL,
    "netValue" DOUBLE PRECISION NOT NULL,
    "receivedValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceInstallment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceInstallment" ADD CONSTRAINT "ServiceInstallment_serviceSaleId_fkey" FOREIGN KEY ("serviceSaleId") REFERENCES "ServiceSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
