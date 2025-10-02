/*
  Warnings:

  - Made the column `produto_nome` on table `item_orcamento` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."item_orcamento" ALTER COLUMN "produto_nome" SET NOT NULL;
