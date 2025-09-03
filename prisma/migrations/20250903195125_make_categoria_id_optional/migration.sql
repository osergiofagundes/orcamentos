-- DropForeignKey
ALTER TABLE "public"."produto_servico" DROP CONSTRAINT "produto_servico_categoria_id_fkey";

-- AlterTable
ALTER TABLE "public"."produto_servico" ALTER COLUMN "categoria_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."produto_servico" ADD CONSTRAINT "produto_servico_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
