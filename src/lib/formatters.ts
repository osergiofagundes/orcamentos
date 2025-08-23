export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100) // Valor em centavos para reais
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatCpfCnpj(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length === 11) {
    // CPF
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (numbers.length === 14) {
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  return value
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  return value
}

export function formatCep(value: string): string {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function getTipoValorLabel(tipo: string): string {
  const labels: Record<string, string> = {
    UNIDADE: 'un',
    METRO: 'm',
    METRO_QUADRADO: 'm²',
    METRO_CUBICO: 'm³',
    CENTIMETRO: 'cm',
    DUZIA: 'dz',
    QUILO: 'kg',
    GRAMA: 'g',
    QUILOMETRO: 'km',
    LITRO: 'l',
    MINUTO: 'min',
    HORA: 'h',
    DIA: 'dia',
    MES: 'mês',
    ANO: 'ano'
  }
  
  return labels[tipo] || tipo
}
