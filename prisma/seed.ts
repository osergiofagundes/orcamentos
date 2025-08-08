import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Buscar a primeira área de trabalho
  const areaTrabalho = await prisma.areaTrabalho.findFirst()
  
  if (!areaTrabalho) {
    console.log('Nenhuma área de trabalho encontrada. Criando área de trabalho primeiro...')
    return
  }

  // Verificar se já existem categorias
  const existingCategories = await prisma.categoria.findMany({
    where: {
      area_trabalho_id: areaTrabalho.id
    }
  })

  if (existingCategories.length > 0) {
    console.log('Categorias já existem para esta área de trabalho')
    return
  }

  // Criar categorias padrão
  const categorias = [
    'Serviços',
    'Produtos',
    'Consultoria',
    'Manutenção',
    'Desenvolvimento'
  ]

  for (const nome of categorias) {
    await prisma.categoria.create({
      data: {
        nome,
        area_trabalho_id: areaTrabalho.id
      }
    })
  }

  console.log('Categorias criadas com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
