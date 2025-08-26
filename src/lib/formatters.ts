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
  
  // Limita a 14 dígitos (CNPJ é o maior)
  const limitedNumbers = numbers.substring(0, 14)
  
  if (limitedNumbers.length <= 11) {
    // CPF em andamento ou completo
    if (limitedNumbers.length === 11) {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (limitedNumbers.length > 6) {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
    } else if (limitedNumbers.length > 3) {
      return limitedNumbers.replace(/(\d{3})(\d{0,3})/, '$1.$2')
    }
    return limitedNumbers
  } else {
    // CNPJ em andamento ou completo
    if (limitedNumbers.length === 14) {
      return limitedNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    } else if (limitedNumbers.length > 11) {
      return limitedNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5')
    } else if (limitedNumbers.length > 8) {
      return limitedNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4')
    } else if (limitedNumbers.length > 5) {
      return limitedNumbers.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3')
    } else if (limitedNumbers.length > 2) {
      return limitedNumbers.replace(/(\d{2})(\d{0,3})/, '$1.$2')
    }
    return limitedNumbers
  }
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.substring(0, 11)
  
  if (limitedNumbers.length <= 10) {
    // Telefone fixo em andamento ou completo
    if (limitedNumbers.length === 10) {
      return limitedNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else if (limitedNumbers.length > 6) {
      return limitedNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else if (limitedNumbers.length > 2) {
      return limitedNumbers.replace(/(\d{2})(\d{0,4})/, '($1) $2')
    } else if (limitedNumbers.length > 0) {
      return `(${limitedNumbers}`
    }
    return limitedNumbers
  } else {
    // Celular (11 dígitos)
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

export function formatCep(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 8 dígitos
  const limitedNumbers = numbers.substring(0, 8)
  
  if (limitedNumbers.length > 5) {
    return limitedNumbers.replace(/(\d{5})(\d{0,3})/, '$1-$2')
  }
  return limitedNumbers
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
