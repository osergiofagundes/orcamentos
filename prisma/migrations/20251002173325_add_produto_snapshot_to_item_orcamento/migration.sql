-- DropForeignKey
ALTER TABLE "public"."item_orcamento" DROP CONSTRAINT "item_orcamento_produto_servico_id_fkey";

-- AlterTable
ALTER TABLE "public"."item_orcamento" ADD COLUMN     "produto_nome" VARCHAR(255),
ADD COLUMN     "produto_tipo" "public"."TipoProdutoServico",
ADD COLUMN     "produto_tipo_valor" "public"."TipoValor",
ALTER COLUMN "produto_servico_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."item_orcamento" ADD CONSTRAINT "item_orcamento_produto_servico_id_fkey" FOREIGN KEY ("produto_servico_id") REFERENCES "public"."produto_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
