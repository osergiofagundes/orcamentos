-- CreateEnum
CREATE TYPE "public"."StatusOrcamento" AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."area_trabalho" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "cpf_cnpj" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "area_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuario_area_trabalho" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "area_trabalho_id" INTEGER NOT NULL,
    "nivel_permissao" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_area_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cliente" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cpf_cnpj" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(255) NOT NULL,
    "email" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "area_trabalho_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orcamento" (
    "id" SERIAL NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor_total" INTEGER,
    "status" "public"."StatusOrcamento" NOT NULL DEFAULT 'RASCUNHO',
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "area_trabalho_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_orcamento" (
    "id" SERIAL NOT NULL,
    "orcamento_id" INTEGER NOT NULL,
    "produto_servico_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produto_servico" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "valor" INTEGER,
    "categoria_id" INTEGER NOT NULL,
    "area_trabalho_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "produto_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categoria" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "area_trabalho_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_area_trabalho_usuario_id_area_trabalho_id_key" ON "public"."usuario_area_trabalho"("usuario_id", "area_trabalho_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cpf_cnpj_key" ON "public"."cliente"("cpf_cnpj");

-- AddForeignKey
ALTER TABLE "public"."usuario_area_trabalho" ADD CONSTRAINT "usuario_area_trabalho_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_area_trabalho" ADD CONSTRAINT "usuario_area_trabalho_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cliente" ADD CONSTRAINT "cliente_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orcamento" ADD CONSTRAINT "orcamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orcamento" ADD CONSTRAINT "orcamento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orcamento" ADD CONSTRAINT "orcamento_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_orcamento" ADD CONSTRAINT "item_orcamento_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_orcamento" ADD CONSTRAINT "item_orcamento_produto_servico_id_fkey" FOREIGN KEY ("produto_servico_id") REFERENCES "public"."produto_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produto_servico" ADD CONSTRAINT "produto_servico_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produto_servico" ADD CONSTRAINT "produto_servico_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categoria" ADD CONSTRAINT "categoria_area_trabalho_id_fkey" FOREIGN KEY ("area_trabalho_id") REFERENCES "public"."area_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
