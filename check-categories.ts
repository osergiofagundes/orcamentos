import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Buscar a primeira área de trabalho
  const areaTrabalho = await prisma.areaTrabalho.findFirst()
  
  if (!areaTrabalho) {
    console.log('Nenhuma área de trabalho encontrada.')
    return
  }

  console.log(`Área de trabalho: ${areaTrabalho.nome}`)

  // Buscar categorias existentes
  const categorias = await prisma.categoria.findMany({
    where: {
      area_trabalho_id: areaTrabalho.id
    }
  })

  console.log('Categorias encontradas:')
  categorias.forEach(cat => {
    console.log(`- ${cat.nome}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
