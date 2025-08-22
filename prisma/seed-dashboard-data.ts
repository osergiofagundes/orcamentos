import { PrismaClient, StatusOrcamento } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Buscar dados existentes
  const areaTrabalho = await prisma.areaTrabalho.findFirst()
  const usuarios = await prisma.usuarioAreaTrabalho.findMany({
    where: {
      area_trabalho_id: areaTrabalho?.id
    }
  })
  const clientes = await prisma.cliente.findMany({
    where: {
      area_trabalho_id: areaTrabalho?.id
    }
  })
  const produtos = await prisma.produtoServico.findMany({
    where: {
      area_trabalho_id: areaTrabalho?.id
    }
  })

  if (!areaTrabalho || usuarios.length === 0 || clientes.length === 0 || produtos.length === 0) {
    console.log('Dados necessários não encontrados. Execute os seeds básicos primeiro.')
    return
  }

  console.log(`Criando orçamentos para área de trabalho: ${areaTrabalho.nome}`)

  // Criar orçamentos dos últimos 6 meses
  const statuses: StatusOrcamento[] = ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CANCELADO']
  const now = new Date()

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    
    // Criar entre 3-8 orçamentos por mês
    const numOrcamentos = Math.floor(Math.random() * 6) + 3
    
    for (let i = 0; i < numOrcamentos; i++) {
      // Data aleatória no mês
      const dayOfMonth = Math.floor(Math.random() * 28) + 1
      const dataOrcamento = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayOfMonth)
      
      // Cliente e usuário aleatório
      const cliente = clientes[Math.floor(Math.random() * clientes.length)]
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)]
      
      // Status com peso: mais aprovados nos meses anteriores
      let status: StatusOrcamento
      if (monthOffset > 2) {
        // Meses mais antigos: maior chance de aprovado/rejeitado
        status = Math.random() > 0.3 ? 'APROVADO' : Math.random() > 0.7 ? 'REJEITADO' : 'ENVIADO'
      } else if (monthOffset > 0) {
        // Meses recentes: mistura
        status = statuses[Math.floor(Math.random() * statuses.length)]
      } else {
        // Mês atual: mais rascunhos e enviados
        status = Math.random() > 0.4 ? 'RASCUNHO' : 'ENVIADO'
      }

      // Criar orçamento
      const orcamento = await prisma.orcamento.create({
        data: {
          data_criacao: dataOrcamento,
          status,
          cliente_id: cliente.id,
          usuario_id: usuario.usuario_id,
          area_trabalho_id: areaTrabalho.id,
          observacoes: `Orçamento ${status.toLowerCase()} - ${dataOrcamento.toLocaleDateString('pt-BR')}`
        }
      })

      // Adicionar itens ao orçamento (1-4 produtos)
      const numItens = Math.floor(Math.random() * 4) + 1
      let valorTotal = 0

      for (let j = 0; j < numItens; j++) {
        const produto = produtos[Math.floor(Math.random() * produtos.length)]
        const quantidade = Math.floor(Math.random() * 10) + 1
        const precoUnitario = produto.valor || Math.floor(Math.random() * 10000) + 1000

        await prisma.itemOrcamento.create({
          data: {
            orcamento_id: orcamento.id,
            produto_servico_id: produto.id,
            quantidade,
            preco_unitario: precoUnitario
          }
        })

        valorTotal += quantidade * precoUnitario
      }

      // Atualizar valor total do orçamento
      await prisma.orcamento.update({
        where: { id: orcamento.id },
        data: { valor_total: valorTotal }
      })

      console.log(`Orçamento criado: ${status} - R$ ${(valorTotal / 100).toFixed(2)} - ${dataOrcamento.toLocaleDateString('pt-BR')}`)
    }
  }

  console.log('Orçamentos de exemplo criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
