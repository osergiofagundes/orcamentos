import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

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

    // 2. Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // 3. Buscar conta com providerId = email-password (Better Auth padrão)
    let account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'email-password',
      },
    })

    // 4. Se não existir conta com email-password, criar uma
    if (!account) {
      account = await prisma.account.create({
        data: {
          id: crypto.randomUUID(), // como o id não tem default, precisa gerar aqui
          accountId: user.email,   // no Better Auth, o email é o identificador da conta
          providerId: 'email-password',
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } else {
      // 5. Se existir, atualizar a senha
      await prisma.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      })
    }

    // 6. Limpar token de reset
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
