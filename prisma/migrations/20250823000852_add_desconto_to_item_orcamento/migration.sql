-- AlterTable
ALTER TABLE "public"."item_orcamento" ADD COLUMN     "desconto_percentual" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN     "desconto_valor" INTEGER DEFAULT 0;
