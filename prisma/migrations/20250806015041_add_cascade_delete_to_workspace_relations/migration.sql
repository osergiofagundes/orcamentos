-- DropForeignKey
ALTER TABLE "public"."usuario_area_trabalho" DROP CONSTRAINT "usuario_area_trabalho_area_trabalho_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."usuario_area_trabalho" DROP CONSTRAINT "usuario_area_trabalho_usuario_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."usuario_area_trabalho" ADD CONSTRAINT "usuario_area_trabalho_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_area_trabalho" ADD CONSTRAINT "usuario_area_trabalho_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;
