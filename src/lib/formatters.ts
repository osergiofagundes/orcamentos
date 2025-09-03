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

export function validateCpf(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '')
  
  if (numbers.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (numbers.split('').every(digit => digit === numbers[0])) return false
  
  // Valida primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i)
  }
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder
  
  if (digit1 !== parseInt(numbers[9])) return false
  
  // Valida segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i)
  }
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder
  
  return digit2 === parseInt(numbers[10])
}

export function validateCnpj(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '')
  
  if (numbers.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (numbers.split('').every(digit => digit === numbers[0])) return false
  
  // Valida primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i]
  }
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder
  
  if (digit1 !== parseInt(numbers[12])) return false
  
  // Valida segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i]
  }
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder
  
  return digit2 === parseInt(numbers[13])
}

export function validateCpfCnpj(value: string): boolean {
  if (!value) return true // Campo opcional
  
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length === 11) {
    return validateCpf(value)
  } else if (numbers.length === 14) {
    return validateCnpj(value)
  }
  
  return false
}
