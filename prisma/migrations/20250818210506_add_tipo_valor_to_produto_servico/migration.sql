-- CreateEnum
CREATE TYPE "public"."TipoValor" AS ENUM ('UNIDADE', 'METRO', 'PESO');

-- AlterTable
ALTER TABLE "public"."produto_servico" ADD COLUMN     "tipo_valor" "public"."TipoValor" NOT NULL DEFAULT 'UNIDADE';
