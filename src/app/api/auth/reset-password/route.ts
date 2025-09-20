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
      console.log('Token não encontrado ou expirado:', token)
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    console.log('Usuário encontrado para reset de senha:', user.email, '| ID:', user.id)

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Nova senha hasheada gerada:', hashedPassword.substring(0, 20) + '...')

    // Buscar a conta associada ao usuário (better-auth armazena senhas na tabela account)
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'credential', // Para autenticação por email/senha
      },
    })

    console.log('Conta credential encontrada:', !!account, account ? `| ID: ${account.id}` : '')

    let passwordUpdateResult;
    
    if (account) {
      // Atualizar senha na tabela account existente
      console.log('Iniciando atualização da senha na conta existente...')
      passwordUpdateResult = await prisma.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
        },
      })
      console.log('Senha atualizada com sucesso na conta existente:', account.id)
    } else {
      // Criar nova conta credential se não existir (caso do usuário Google)
      console.log('Criando nova conta credential para usuário sem conta de senha...')
      const newAccount = await prisma.account.create({
        data: {
          id: `credential_${user.id}_${Date.now()}`,
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      passwordUpdateResult = newAccount;
      console.log('Nova conta credential criada com sucesso:', newAccount.id)
    }

    // Verificar se a operação foi bem-sucedida
    if (!passwordUpdateResult) {
      console.log('Erro: Falha ao alterar a senha - resultado vazio')
      return NextResponse.json(
        { error: 'Erro ao alterar senha' },
        { status: 500 }
      )
    }

    console.log('Confirmação: Senha alterada com sucesso no banco de dados')

    // Limpar token de reset do usuário
    console.log('🧹 Limpando token de reset do usuário...')
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
    console.log('Token de reset removido com sucesso')

    console.log('SUCESSO COMPLETO: Processo de reset de senha finalizado para usuário:', user.email)

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Erro de validação:', error.errors)
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('ERRO CRÍTICO ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}