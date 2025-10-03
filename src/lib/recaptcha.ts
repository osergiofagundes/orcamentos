/**
 * Valida o token reCAPTCHA no servidor
 * @param token - Token do reCAPTCHA a ser validado
 * @returns Promise<boolean> - true se válido, false caso contrário
 */
export async function validateRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY não encontrada nas variáveis de ambiente')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()
    
    return data.success === true
  } catch (error) {
    console.error('Erro ao validar reCAPTCHA:', error)
    return false
  }
}