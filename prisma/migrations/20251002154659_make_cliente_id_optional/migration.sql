-- DropForeignKey
ALTER TABLE "public"."orcamento" DROP CONSTRAINT "orcamento_cliente_id_fkey";

-- AlterTable
ALTER TABLE "public"."orcamento" ALTER COLUMN "cliente_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."orcamento" ADD CONSTRAINT "orcamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
