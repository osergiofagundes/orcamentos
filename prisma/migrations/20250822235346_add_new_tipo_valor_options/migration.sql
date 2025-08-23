/*
  Warnings:

  - The values [PESO] on the enum `TipoValor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TipoValor_new" AS ENUM ('UNIDADE', 'METRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'CENTIMETRO', 'DUZIA', 'QUILO', 'GRAMA', 'QUILOMETRO', 'LITRO', 'MINUTO', 'HORA', 'DIA', 'MES', 'ANO');
ALTER TABLE "public"."produto_servico" ALTER COLUMN "tipo_valor" DROP DEFAULT;
ALTER TABLE "public"."produto_servico" ALTER COLUMN "tipo_valor" TYPE "public"."TipoValor_new" USING ("tipo_valor"::text::"public"."TipoValor_new");
ALTER TYPE "public"."TipoValor" RENAME TO "TipoValor_old";
ALTER TYPE "public"."TipoValor_new" RENAME TO "TipoValor";
DROP TYPE "public"."TipoValor_old";
ALTER TABLE "public"."produto_servico" ALTER COLUMN "tipo_valor" SET DEFAULT 'UNIDADE';
COMMIT;
