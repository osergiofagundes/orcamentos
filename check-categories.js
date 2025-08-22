import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const categorias = await prisma.categoria.findMany()
  console.log('Categorias encontradas:')
  categorias.forEach(c => {
    console.log(`- ID: ${c.id}, Nome: ${c.nome}`)
  })
  
  const areaTrabalho = await prisma.areaTrabalho.findFirst()
  console.log(`\nÁrea de trabalho: ${areaTrabalho?.nome}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
