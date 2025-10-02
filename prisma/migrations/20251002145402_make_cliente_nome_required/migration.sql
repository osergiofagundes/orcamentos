/*
  Warnings:

  - Made the column `cliente_nome` on table `orcamento` required. This step will fail if there are existing NULL values in that column.

*/

-- First, update any existing NULL values to a default value
UPDATE "public"."orcamento" 
SET "cliente_nome" = 'Cliente não informado'
WHERE "cliente_nome" IS NULL;

-- AlterTable
ALTER TABLE "public"."orcamento" ALTER COLUMN "cliente_nome" SET NOT NULL;
