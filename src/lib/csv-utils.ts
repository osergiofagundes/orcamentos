/**
 * Utilitários para manipulação de arquivos CSV
 */

export interface ClienteCSV {
  nome: string
  cpf_cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

/**
 * Converte array de objetos para CSV
 */
export function convertToCSV(data: ClienteCSV[]): string {
  if (data.length === 0) {
    return ''
  }

  // Cabeçalhos
  const headers = [
    'Nome',
    'CPF/CNPJ',
    'Telefone',
    'Email',
    'Endereço',
    'Bairro',
    'Cidade',
    'Estado',
    'CEP'
  ]

  // Linhas de dados
  const rows = data.map(item => [
    escapeCSVField(item.nome || ''),
    escapeCSVField(item.cpf_cnpj || ''),
    escapeCSVField(item.telefone || ''),
    escapeCSVField(item.email || ''),
    escapeCSVField(item.endereco || ''),
    escapeCSVField(item.bairro || ''),
    escapeCSVField(item.cidade || ''),
    escapeCSVField(item.estado || ''),
    escapeCSVField(item.cep || '')
  ])

  // Combina cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Escapa campos CSV que contêm vírgulas, aspas ou quebras de linha
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Faz download de um arquivo CSV
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Adiciona BOM para UTF-8 (importante para Excel reconhecer acentos)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Gera template CSV vazio
 */
export function generateCSVTemplate(): string {
  const headers = [
    'Nome',
    'CPF/CNPJ',
    'Telefone',
    'Email',
    'Endereço',
    'Bairro',
    'Cidade',
    'Estado',
    'CEP'
  ]

  // Adiciona uma linha de exemplo
  const exampleRow = [
    'João Silva',
    '122.456.789-00',
    '(11) 98765-4321',
    'joao@example.com',
    'Rua Exemplo, 123',
    'Centro',
    'SP',
    '01234-567'
  ]

  return [headers.join(','), exampleRow.join(',')].join('\n')
}

/**
 * Parse CSV string para array de objetos
 */
export function parseCSV(csvContent: string): ClienteCSV[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length < 2) {
    throw new Error('CSV deve conter pelo menos o cabeçalho e uma linha de dados')
  }

  // Remove BOM se presente
  const firstLine = lines[0].replace(/^\uFEFF/, '')
  
  // Parse do cabeçalho
  const headers = parseCSVLine(firstLine)
  
  // Valida cabeçalhos esperados
  const expectedHeaders = ['nome', 'cpf/cnpj', 'telefone', 'email', 'endereço', 'bairro', 'cidade', 'estado', 'cep']
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  
  const hasValidHeaders = expectedHeaders.every(expected => 
    normalizedHeaders.some(header => header.includes(expected.toLowerCase()))
  )
  
  if (!hasValidHeaders) {
    throw new Error('Cabeçalhos do CSV não correspondem ao formato esperado')
  }

  // Mapeia índices dos cabeçalhos
  const headerMap: Record<string, number> = {}
  normalizedHeaders.forEach((header, index) => {
    if (header.includes('nome')) headerMap.nome = index
    if (header.includes('cpf') || header.includes('cnpj')) headerMap.cpf_cnpj = index
    if (header.includes('telefone')) headerMap.telefone = index
    if (header.includes('email')) headerMap.email = index
    if (header.includes('endereço') || header.includes('endereco')) headerMap.endereco = index
    if (header.includes('bairro')) headerMap.bairro = index
    if (header.includes('cidade')) headerMap.cidade = index
    if (header.includes('estado')) headerMap.estado = index
    if (header.includes('cep')) headerMap.cep = index
  })

  // Parse das linhas de dados
  const data: ClienteCSV[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length === 0 || values.every(v => !v.trim())) {
      continue // Pula linhas vazias
    }

    const cliente: ClienteCSV = {
      nome: values[headerMap.nome]?.trim() || '',
      cpf_cnpj: values[headerMap.cpf_cnpj]?.trim() || undefined,
      telefone: values[headerMap.telefone]?.trim() || undefined,
      email: values[headerMap.email]?.trim() || undefined,
      endereco: values[headerMap.endereco]?.trim() || undefined,
      bairro: values[headerMap.bairro]?.trim() || undefined,
      cidade: values[headerMap.cidade]?.trim() || undefined,
      estado: values[headerMap.estado]?.trim() || undefined,
      cep: values[headerMap.cep]?.trim() || undefined,
    }

    // Validação básica - nome é obrigatório
    if (!cliente.nome || cliente.nome.trim() === '') {
      continue // Pula linhas sem nome
    }

    data.push(cliente)
  }

  return data
}

/**
 * Parse de uma linha CSV, lidando com campos entre aspas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let currentValue = ''
  let insideQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Aspas duplas escapadas
        currentValue += '"'
        i++ // Pula o próximo caractere
      } else {
        // Toggle do estado de dentro de aspas
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      // Fim do campo
      values.push(currentValue)
      currentValue = ''
    } else {
      currentValue += char
    }
  }
  
  // Adiciona o último campo
  values.push(currentValue)
  
  return values
}

// ==================== PRODUTOS E SERVIÇOS ====================

export interface ProdutoCSV {
  nome: string
  valor?: string
  tipo: "PRODUTO" | "SERVICO"
  tipo_valor: "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO"
  categoria?: string
}

/**
 * Converte array de produtos para CSV
 */
export function convertProdutosToCSV(data: ProdutoCSV[]): string {
  if (data.length === 0) {
    return ''
  }

  // Cabeçalhos
  const headers = [
    'Nome',
    'Valor',
    'Tipo',
    'Tipo de Valor',
    'Categoria'
  ]

  // Linhas de dados
  const rows = data.map(item => [
    escapeCSVField(item.nome || ''),
    escapeCSVField(item.valor || ''),
    escapeCSVField(item.tipo || ''),
    escapeCSVField(item.tipo_valor || ''),
    escapeCSVField(item.categoria || '')
  ])

  // Combina cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Gera template CSV para produtos
 */
export function generateProdutosCSVTemplate(): string {
  const headers = [
    'Nome',
    'Valor',
    'Tipo',
    'Tipo de Valor',
    'Categoria'
  ]

  // Adiciona linhas de exemplo
  const exampleRows = [
    [
      'Produto Exemplo',
      '100.50',
      'PRODUTO',
      'UNIDADE',
      ''
    ],
    [
      'Serviço Exemplo',
      '250.00',
      'SERVICO',
      'HORA',
      ''
    ]
  ]

  return [
    headers.join(','),
    ...exampleRows.map(row => row.join(','))
  ].join('\n')
}

/**
 * Parse CSV de produtos para array de objetos
 */
export function parseProdutosCSV(csvContent: string): ProdutoCSV[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length < 2) {
    throw new Error('CSV deve conter pelo menos o cabeçalho e uma linha de dados')
  }

  // Remove BOM se presente
  const firstLine = lines[0].replace(/^\uFEFF/, '')
  
  // Parse do cabeçalho
  const headers = parseCSVLine(firstLine)
  
  // Valida cabeçalhos esperados
  const expectedHeaders = ['nome', 'valor', 'tipo', 'tipo de valor', 'categoria']
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  
  const hasValidHeaders = expectedHeaders.every(expected => 
    normalizedHeaders.some(header => header.includes(expected.toLowerCase()))
  )
  
  if (!hasValidHeaders) {
    throw new Error('Cabeçalhos do CSV não correspondem ao formato esperado')
  }

  // Mapeia índices dos cabeçalhos
  const headerMap: Record<string, number> = {}
  normalizedHeaders.forEach((header, index) => {
    if (header.includes('nome') && !headerMap.nome) headerMap.nome = index
    if (header.includes('valor') && !header.includes('tipo') && !headerMap.valor) headerMap.valor = index
    if (header.includes('tipo') && !header.includes('valor') && !headerMap.tipo) headerMap.tipo = index
    if ((header.includes('tipo') && header.includes('valor')) || header === 'tipo de valor') headerMap.tipo_valor = index
    if (header.includes('categoria') && !headerMap.categoria) headerMap.categoria = index
  })

  // Valida que todos os campos obrigatórios foram encontrados
  if (headerMap.nome === undefined || headerMap.tipo === undefined || headerMap.tipo_valor === undefined) {
    throw new Error('Cabeçalhos obrigatórios não encontrados: Nome, Tipo e Tipo de Valor são obrigatórios')
  }

  // Valida tipos permitidos
  const tiposPermitidos = ['PRODUTO', 'SERVICO']
  const tiposValorPermitidos = [
    'UNIDADE', 'METRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'CENTIMETRO', 
    'DUZIA', 'QUILO', 'GRAMA', 'QUILOMETRO', 'LITRO', 'MINUTO', 
    'HORA', 'DIA', 'MES', 'ANO'
  ]

  // Parse das linhas de dados
  const data: ProdutoCSV[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length === 0 || values.every(v => !v.trim())) {
      continue // Pula linhas vazias
    }

    const tipo = (values[headerMap.tipo]?.trim().toUpperCase() || '') as "PRODUTO" | "SERVICO"
    const tipoValor = (values[headerMap.tipo_valor]?.trim().toUpperCase() || '') as any

    // Validação de tipo
    if (!tiposPermitidos.includes(tipo)) {
      throw new Error(`Linha ${i + 2}: Tipo inválido "${tipo}". Deve ser PRODUTO ou SERVICO.`)
    }

    // Validação de tipo_valor
    if (!tiposValorPermitidos.includes(tipoValor)) {
      throw new Error(`Linha ${i + 2}: Tipo de valor inválido "${tipoValor}".`)
    }

    const produto: ProdutoCSV = {
      nome: values[headerMap.nome]?.trim() || '',
      valor: values[headerMap.valor]?.trim() || undefined,
      tipo,
      tipo_valor: tipoValor,
      categoria: values[headerMap.categoria]?.trim() || undefined,
    }

    // Validação básica - nome é obrigatório
    if (!produto.nome || produto.nome.trim() === '') {
      continue // Pula linhas sem nome
    }

    data.push(produto)
  }

  return data
}

// ==================== CATEGORIAS ====================

export interface CategoriaCSV {
  nome: string
}

/**
 * Converte array de categorias para CSV
 */
export function convertCategoriasToCSV(data: CategoriaCSV[]): string {
  if (data.length === 0) {
    return ''
  }

  // Cabeçalhos
  const headers = [
    'Nome'
  ]

  // Linhas de dados
  const rows = data.map(item => [
    escapeCSVField(item.nome || '')
  ])

  // Combina cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Gera template CSV para categorias
 */
export function generateCategoriasCSVTemplate(): string {
  const headers = [
    'Nome'
  ]

  // Adiciona linhas de exemplo
  const exampleRows = [
    ['Categoria Exemplo 1'],
    ['Categoria Exemplo 2'],
    ['Categoria Exemplo 3']
  ]

  return [
    headers.join(','),
    ...exampleRows.map(row => row.join(','))
  ].join('\n')
}

/**
 * Parse CSV de categorias para array de objetos
 */
export function parseCategoriasCSV(csvContent: string): CategoriaCSV[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length < 2) {
    throw new Error('CSV deve conter pelo menos o cabeçalho e uma linha de dados')
  }

  // Remove BOM se presente
  const firstLine = lines[0].replace(/^\uFEFF/, '')
  
  // Parse do cabeçalho
  const headers = parseCSVLine(firstLine)
  
  // Valida cabeçalhos esperados
  const expectedHeaders = ['nome']
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  
  const hasValidHeaders = expectedHeaders.every(expected => 
    normalizedHeaders.some(header => header.includes(expected.toLowerCase()))
  )
  
  if (!hasValidHeaders) {
    throw new Error('Cabeçalhos do CSV não correspondem ao formato esperado. Deve conter "Nome"')
  }

  // Mapeia índices dos cabeçalhos
  const headerMap: Record<string, number> = {}
  normalizedHeaders.forEach((header, index) => {
    if (header.includes('nome') && !headerMap.nome) headerMap.nome = index
  })

  // Valida que o campo obrigatório foi encontrado
  if (headerMap.nome === undefined) {
    throw new Error('Cabeçalho obrigatório não encontrado: Nome é obrigatório')
  }

  // Parse das linhas de dados
  const data: CategoriaCSV[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length === 0 || values.every(v => !v.trim())) {
      continue // Pula linhas vazias
    }

    const categoria: CategoriaCSV = {
      nome: values[headerMap.nome]?.trim() || '',
    }

    // Validação básica - nome é obrigatório
    if (!categoria.nome || categoria.nome.trim() === '') {
      continue // Pula linhas sem nome
    }

    // Validação de tamanho máximo (50 caracteres conforme schema)
    if (categoria.nome.length > 50) {
      throw new Error(`Linha ${i + 2}: Nome da categoria excede 50 caracteres: "${categoria.nome}"`)
    }

    data.push(categoria)
  }

  return data
}

// ==================== ORÇAMENTOS ====================

export interface OrcamentoCSV {
  id: number
  data_criacao: string
  valor_total: string
  status: string
  observacoes?: string
  cliente_nome: string
  cliente_cpf_cnpj?: string
  cliente_telefone?: string
  cliente_email?: string
  cliente_endereco?: string
  cliente_bairro?: string
  cliente_cidade?: string
  cliente_estado?: string
  cliente_cep?: string
  responsavel: string
  item_produto_nome: string
  item_produto_tipo?: string
  item_produto_tipo_valor?: string
  item_quantidade: number
  item_preco_unitario: string
  item_desconto_percentual?: string
  item_desconto_valor?: string
  item_subtotal: string
}

/**
 * Converte array de orçamentos para CSV
 * Cada item do orçamento vira uma linha no CSV
 */
export function convertOrcamentosToCSV(data: OrcamentoCSV[]): string {
  if (data.length === 0) {
    return ''
  }

  // Cabeçalhos
  const headers = [
    'ID Orçamento',
    'Data de Criação',
    'Valor Total',
    'Status',
    'Observações',
    'Cliente - Nome',
    'Cliente - CPF/CNPJ',
    'Cliente - Telefone',
    'Cliente - Email',
    'Cliente - Endereço',
    'Cliente - Bairro',
    'Cliente - Cidade',
    'Cliente - Estado',
    'Cliente - CEP',
    'Responsável',
    'Item - Produto/Serviço',
    'Item - Tipo',
    'Item - Tipo de Valor',
    'Item - Quantidade',
    'Item - Preço Unitário',
    'Item - Desconto %',
    'Item - Desconto Valor',
    'Item - Subtotal'
  ]

  // Linhas de dados
  const rows = data.map(item => [
    escapeCSVField(item.id.toString()),
    escapeCSVField(item.data_criacao || ''),
    escapeCSVField(item.valor_total || ''),
    escapeCSVField(item.status || ''),
    escapeCSVField(item.observacoes || ''),
    escapeCSVField(item.cliente_nome || ''),
    escapeCSVField(item.cliente_cpf_cnpj || ''),
    escapeCSVField(item.cliente_telefone || ''),
    escapeCSVField(item.cliente_email || ''),
    escapeCSVField(item.cliente_endereco || ''),
    escapeCSVField(item.cliente_bairro || ''),
    escapeCSVField(item.cliente_cidade || ''),
    escapeCSVField(item.cliente_estado || ''),
    escapeCSVField(item.cliente_cep || ''),
    escapeCSVField(item.responsavel || ''),
    escapeCSVField(item.item_produto_nome || ''),
    escapeCSVField(item.item_produto_tipo || ''),
    escapeCSVField(item.item_produto_tipo_valor || ''),
    escapeCSVField(item.item_quantidade.toString()),
    escapeCSVField(item.item_preco_unitario || ''),
    escapeCSVField(item.item_desconto_percentual || ''),
    escapeCSVField(item.item_desconto_valor || ''),
    escapeCSVField(item.item_subtotal || '')
  ])

  // Combina cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

// ============================================
// FUNÇÕES PARA RELATÓRIOS
// ============================================

export interface OrcamentoPorClienteCSV {
  clienteNome: string
  quantidadeOrcamentos: number
  valorTotal: number
}

/**
 * Converte orçamentos por cliente para CSV
 */
export function convertOrcamentosPorClienteToCSV(data: OrcamentoPorClienteCSV[]): string {
  if (data.length === 0) {
    return ''
  }

  // Cabeçalhos
  const headers = [
    'Cliente',
    'Quantidade de Orçamentos',
    'Valor Total (R$)'
  ]

  // Linhas de dados
  const rows = data.map(item => [
    escapeCSVField(item.clienteNome || ''),
    escapeCSVField(item.quantidadeOrcamentos.toString()),
    escapeCSVField((item.valorTotal / 100).toFixed(2))
  ])

  // Combina cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export interface ProdutoMaisOrcadoCSV {
  produtoNome: string
  vezesOrcado: number
  quantidadeTotal: number
}

/**
 * Converte produtos mais orçados para CSV
 */
export function convertProdutosMaisOrcadosToCSV(data: ProdutoMaisOrcadoCSV[]): string {
  if (data.length === 0) {
    return ''
  }

  // Cabeçalhos
  const headers = [
    'Produto/Serviço',
    'Vezes Orçado',
    'Quantidade Total'
  ]

  // Linhas de dados
  const rows = data.map(item => [
    escapeCSVField(item.produtoNome || ''),
    escapeCSVField(item.vezesOrcado.toString()),
    escapeCSVField(item.quantidadeTotal.toString())
  ])

  // Combina cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

