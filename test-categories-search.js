// Arquivo de teste temporário para demonstrar a busca em categorias
// Execute: node test-categories-search.js

const testCategories = [
  {
    id: 1,
    nome: 'Serviços',
    descricao: 'Categoria para serviços diversos'
  },
  {
    id: 2,
    nome: 'Produtos',
    descricao: 'Categoria para produtos físicos'
  },
  {
    id: 3,
    nome: 'Consultoria',
    descricao: 'Serviços de consultoria especializada'
  },
  {
    id: 4,
    nome: 'Desenvolvimento',
    descricao: 'Desenvolvimento de software e aplicações'
  },
  {
    id: 5,
    nome: 'Manutenção',
    descricao: null
  }
]

function testCategorySearch(categories, searchTerm) {
  console.log(`\n=== Testando busca de categorias por: "${searchTerm}" ===`)
  
  const results = categories.filter(category => {
    if (!searchTerm || searchTerm.trim() === '') return true
    
    const search = searchTerm.toLowerCase().trim()
    
    const matchesText = (text) => {
      if (text === null || text === undefined) return false
      return text.toString().toLowerCase().includes(search)
    }
    
    return (
      matchesText(category.id) ||
      matchesText(category.nome) ||
      matchesText(category.descricao)
    )
  })
  
  console.log(`Encontrados: ${results.length} categoria(s)`)
  results.forEach(category => {
    console.log(`- ${category.nome} (ID: ${category.id}) - ${category.descricao || 'Sem descrição'}`)
  })
}

// Testes
testCategorySearch(testCategories, '1') // Deve encontrar ID 1
testCategorySearch(testCategories, 'serviços') // Deve encontrar "Serviços"
testCategorySearch(testCategories, 'produtos') // Deve encontrar "Produtos"
testCategorySearch(testCategories, 'consultoria') // Deve encontrar "Consultoria"
testCategorySearch(testCategories, 'desenvolvimento') // Deve encontrar "Desenvolvimento"
testCategorySearch(testCategories, 'software') // Deve encontrar na descrição de "Desenvolvimento"
testCategorySearch(testCategories, 'físicos') // Deve encontrar na descrição de "Produtos"
testCategorySearch(testCategories, 'manutenção') // Deve encontrar "Manutenção"
