/*
  Warnings:

  - Made the column `cliente_nome` on table `orcamento` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."orcamento" ALTER COLUMN "cliente_nome" SET NOT NULL;
