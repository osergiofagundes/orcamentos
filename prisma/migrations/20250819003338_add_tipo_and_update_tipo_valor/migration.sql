-- CreateEnum
CREATE TYPE "public"."TipoProdutoServico" AS ENUM ('PRODUTO', 'SERVICO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TipoValor" ADD VALUE 'HORA';
ALTER TYPE "public"."TipoValor" ADD VALUE 'DIA';

-- AlterTable
ALTER TABLE "public"."produto_servico" ADD COLUMN     "tipo" "public"."TipoProdutoServico" NOT NULL DEFAULT 'PRODUTO';
