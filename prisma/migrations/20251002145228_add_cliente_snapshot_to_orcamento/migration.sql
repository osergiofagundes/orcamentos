-- AlterTable
ALTER TABLE "public"."orcamento" ADD COLUMN     "cliente_bairro" VARCHAR(255),
ADD COLUMN     "cliente_cep" VARCHAR(255),
ADD COLUMN     "cliente_cidade" VARCHAR(255),
ADD COLUMN     "cliente_cpf_cnpj" VARCHAR(255),
ADD COLUMN     "cliente_email" TEXT,
ADD COLUMN     "cliente_endereco" TEXT,
ADD COLUMN     "cliente_estado" VARCHAR(255),
ADD COLUMN     "cliente_nome" VARCHAR(255),
ADD COLUMN     "cliente_telefone" VARCHAR(255);
