import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { scryptAsync } from '@noble/hashes/scrypt.js'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

// Configuração scrypt idêntica ao Better Auth
const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

// Função para converter bytes para hex (compatível com Better Auth)
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Função para gerar salt aleatório em hex
function generateSalt(): string {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  return bytesToHex(saltBytes)
}

// Função para gerar key usando scrypt (mesmo algoritmo do Better Auth)
async function generateKey(password: string, salt: string): Promise<Uint8Array> {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2,
  })
}

// Função hashPassword compatível com Better Auth
async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt()
  const key = await generateKey(password, salt)
  return `${salt}:${bytesToHex(key)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // 1. Buscar usuário pelo token válido
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // 2. Gerar hash da nova senha no formato salt:hash (mesma implementação do Better Auth)
    const hashedPassword = await hashPassword(password)

    // 3. Buscar conta com providerId = email-password (Better Auth padrão)
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'credential',
      },
    })

    // 4. Se existir, atualizar a senha
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      })
    }

    // 5. Limpar token de reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
