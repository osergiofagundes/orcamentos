-- DropForeignKey
ALTER TABLE "public"."categoria" DROP CONSTRAINT "categoria_area_trabalho_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cliente" DROP CONSTRAINT "cliente_area_trabalho_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."item_orcamento" DROP CONSTRAINT "item_orcamento_orcamento_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orcamento" DROP CONSTRAINT "orcamento_area_trabalho_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."produto_servico" DROP CONSTRAINT "produto_servico_area_trabalho_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."cliente" ADD CONSTRAINT "cliente_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orcamento" ADD CONSTRAINT "orcamento_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_orcamento" ADD CONSTRAINT "item_orcamento_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produto_servico" ADD CONSTRAINT "produto_servico_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categoria" ADD CONSTRAINT "categoria_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;
