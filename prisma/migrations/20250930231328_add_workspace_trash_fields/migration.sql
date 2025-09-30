-- AlterTable
ALTER TABLE "public"."area_trabalho" ADD COLUMN     "inTrash" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trashedAt" TIMESTAMP(3),
ADD COLUMN     "trashedBy" TEXT;

-- AddForeignKey
ALTER TABLE "public"."area_trabalho" ADD CONSTRAINT "area_trabalho_trashedBy_fkey" FOREIGN KEY ("trashedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
