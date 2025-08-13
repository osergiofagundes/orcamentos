import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Buscar a primeira área de trabalho
  const areaTrabalho = await prisma.areaTrabalho.findFirst()
  
  if (!areaTrabalho) {
    console.log('Nenhuma área de trabalho encontrada.')
    return
  }

  console.log(`Criando dados para área de trabalho: ${areaTrabalho.nome}`)

  // Criar clientes de exemplo
  const clientesExemplo = [
    {
      nome: "João Silva",
      cpf_cnpj: "123.456.789-00",
      telefone: "(11) 99999-9999",
      email: "joao@email.com",
      endereco: "Rua das Flores, 123 - São Paulo/SP"
    },
    {
      nome: "Maria Santos",
      cpf_cnpj: "987.654.321-00",
      telefone: "(11) 88888-8888",
      email: "maria@email.com",
      endereco: "Av. Paulista, 456 - São Paulo/SP"
    },
    {
      nome: "Empresa XYZ Ltda",
      cpf_cnpj: "12.345.678/0001-90",
      telefone: "(11) 3333-3333",
      email: "contato@empresaxyz.com",
      endereco: "Rua Comercial, 789 - São Paulo/SP"
    }
  ]

  for (const cliente of clientesExemplo) {
    const existing = await prisma.cliente.findFirst({
      where: {
        cpf_cnpj: cliente.cpf_cnpj,
        area_trabalho_id: areaTrabalho.id
      }
    })

    if (!existing) {
      await prisma.cliente.create({
        data: {
          ...cliente,
          area_trabalho_id: areaTrabalho.id
        }
      })
      console.log(`Cliente criado: ${cliente.nome}`)
    }
  }

  // Buscar categorias existentes
  const categorias = await prisma.categoria.findMany({
    where: {
      area_trabalho_id: areaTrabalho.id
    }
  })

  if (categorias.length === 0) {
    console.log('Nenhuma categoria encontrada.')
    return
  }

  // Criar produtos/serviços de exemplo
  const produtosServicosExemplo = [
    {
      nome: "Instalação de Calhas",
      descricao: "Serviço completo de instalação de calhas residenciais",
      valor: 25000, // R$ 250,00 em centavos
      categoria_nome: "Tenis"
    },
    {
      nome: "Manutenção de Calhas",
      descricao: "Serviço de limpeza e manutenção de calhas",
      valor: 8000, // R$ 80,00 em centavos
      categoria_nome: "Tenis"
    },
    {
      nome: "Calha de Alumínio - Metro",
      descricao: "Calha de alumínio branca - preço por metro linear",
      valor: 4500, // R$ 45,00 em centavos
      categoria_nome: "Tenis"
    },
    {
      nome: "Rufos e Condutores",
      descricao: "Conjunto de rufos e condutores para acabamento",
      valor: 12000, // R$ 120,00 em centavos
      categoria_nome: "Tenis"
    },
    {
      nome: "Consultoria Técnica",
      descricao: "Avaliação técnica e orçamento personalizado",
      valor: 15000, // R$ 150,00 em centavos
      categoria_nome: "Tenis"
    }
  ]

  for (const produto of produtosServicosExemplo) {
    const categoria = categorias.find(c => c.nome === produto.categoria_nome)
    
    if (!categoria) {
      console.log(`Categoria não encontrada: ${produto.categoria_nome}`)
      continue
    }

    const existing = await prisma.produtoServico.findFirst({
      where: {
        nome: produto.nome,
        area_trabalho_id: areaTrabalho.id
      }
    })

    if (!existing) {
      await prisma.produtoServico.create({
        data: {
          nome: produto.nome,
          descricao: produto.descricao,
          valor: produto.valor,
          categoria_id: categoria.id,
          area_trabalho_id: areaTrabalho.id
        }
      })
      console.log(`Produto/Serviço criado: ${produto.nome}`)
    }
  }

  console.log('Dados de exemplo criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
