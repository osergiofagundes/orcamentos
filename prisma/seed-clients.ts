import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Buscar a primeira área de trabalho
  const areaTrabalho = await prisma.areaTrabalho.findFirst()
  
  if (!areaTrabalho) {
    console.log('Nenhuma área de trabalho encontrada. Criando área de trabalho primeiro...')
    return
  }

  // Verificar se já existem clientes
  const existingClients = await prisma.cliente.findMany({
    where: {
      area_trabalho_id: areaTrabalho.id
    }
  })

  if (existingClients.length > 0) {
    console.log('Clientes já existem para esta área de trabalho')
    return
  }

  // Criar clientes de teste
  const clientesData = [
    {
      nome: 'João Silva',
      cpf_cnpj: '12345678901',
      telefone: '11987654321',
      email: 'joao.silva@email.com',
      endereco: 'Rua das Flores, 123 - São Paulo, SP'
    },
    {
      nome: 'Maria Santos',
      cpf_cnpj: '98765432100',
      telefone: '11876543210',
      email: 'maria.santos@gmail.com',
      endereco: 'Av. Paulista, 456 - São Paulo, SP'
    },
    {
      nome: 'Empresa ABC Ltda',
      cpf_cnpj: '12345678000190',
      telefone: '1133334444',
      email: 'contato@empresaabc.com.br',
      endereco: 'Rua do Comércio, 789 - São Paulo, SP'
    },
    {
      nome: 'Pedro Oliveira',
      cpf_cnpj: '11122233344',
      telefone: '11999888777',
      email: 'pedro.oliveira@hotmail.com',
      endereco: 'Rua da Paz, 321 - São Paulo, SP'
    },
    {
      nome: 'Tech Solutions S.A.',
      cpf_cnpj: '98765432000111',
      telefone: '1122223333',
      email: 'info@techsolutions.com',
      endereco: 'Av. das Nações, 1000 - São Paulo, SP'
    }
  ]

  for (const clienteData of clientesData) {
    await prisma.cliente.create({
      data: {
        ...clienteData,
        area_trabalho_id: areaTrabalho.id
      }
    })
  }

  console.log('Clientes de teste criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
