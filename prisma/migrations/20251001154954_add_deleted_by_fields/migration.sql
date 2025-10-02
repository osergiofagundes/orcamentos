-- AlterTable
ALTER TABLE "public"."categoria" ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."cliente" ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."orcamento" ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."produto_servico" ADD COLUMN     "deletedBy" TEXT;

-- AddForeignKey
ALTER TABLE "public"."cliente" ADD CONSTRAINT "cliente_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orcamento" ADD CONSTRAINT "orcamento_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produto_servico" ADD CONSTRAINT "produto_servico_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categoria" ADD CONSTRAINT "categoria_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
