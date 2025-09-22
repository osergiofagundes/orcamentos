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

    // Buscar usuário pelo token de reset
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token ainda válido
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Buscar a conta associada ao usuário (better-auth armazena senhas na tabela account)
    // Better-auth com emailAndPassword usa 'email-password' como providerId
    let account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'email-password', // Better-auth padrão para email/senha
      },
    })

    // Se não encontrou com 'email-password', tentar outros providerIds comuns
    if (!account) {
      account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential', // Fallback para credential
        },
      })
    }

    // Se ainda não encontrou, procurar qualquer conta que já tenha senha
    if (!account) {
      account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          password: { not: null }
        },
      })
    }

    let passwordUpdateResult;
    
    if (account) {
      // Atualizar senha na tabela account existente
      passwordUpdateResult = await prisma.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
        },
      })
    } else {
      // Criar nova conta email-password se não existir
      passwordUpdateResult = await prisma.account.create({
        data: {
          id: `email-password_${user.id}_${Date.now()}`,
          accountId: user.email, // Usar email como accountId
          providerId: 'email-password', // Usar o padrão do better-auth
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    // Verificar se a operação foi bem-sucedida
    if (!passwordUpdateResult) {
      return NextResponse.json(
        { error: 'Erro ao alterar senha' },
        { status: 500 }
      )
    }

    // Limpar token de reset do usuário
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