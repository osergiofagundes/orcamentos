/*
  Warnings:

  - A unique constraint covering the columns `[cpf_cnpj,area_trabalho_id]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."StatusConvite" AS ENUM ('ATIVO', 'EXPIRADO', 'USADO');

-- CreateEnum
CREATE TYPE "public"."StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- DropIndex
DROP INDEX "public"."cliente_cpf_cnpj_key";

-- CreateTable
CREATE TABLE "public"."convite_workspace" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(255) NOT NULL,
    "area_trabalho_id" INTEGER NOT NULL,
    "criado_por" TEXT NOT NULL,
    "nivel_permissao" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."StatusConvite" NOT NULL DEFAULT 'ATIVO',
    "expira_em" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convite_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solicitacao_entrada" (
    "id" SERIAL NOT NULL,
    "convite_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "status" "public"."StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "mensagem" TEXT,
    "respondido_por" TEXT,
    "respondido_em" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacao_entrada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "convite_workspace_codigo_key" ON "public"."convite_workspace"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "solicitacao_entrada_convite_id_usuario_id_key" ON "public"."solicitacao_entrada"("convite_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cpf_cnpj_area_trabalho_id_key" ON "public"."cliente"("cpf_cnpj", "area_trabalho_id");

-- AddForeignKey
ALTER TABLE "public"."convite_workspace" ADD CONSTRAINT "convite_workspace_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convite_workspace" ADD CONSTRAINT "convite_workspace_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitacao_entrada" ADD CONSTRAINT "solicitacao_entrada_convite_id_fkey" FOREIGN KEY ("convite_id") REFERENCES "public"."convite_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitacao_entrada" ADD CONSTRAINT "solicitacao_entrada_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitacao_entrada" ADD CONSTRAINT "solicitacao_entrada_respondido_por_fkey" FOREIGN KEY ("respondido_por") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
