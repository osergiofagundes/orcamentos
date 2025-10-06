import { NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from 'next/headers'
import { sendVerificationEmail } from '@/lib/email-verification'
import { isGoogleUser } from '@/lib/auth-utils'

// PUT /api/profile - Atualizar perfil do usuário
export async function PUT(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name, email, image } = await req.json()

        // Verificar se o usuário é do Google
        const isGoogle = await isGoogleUser(session.user.id)

        // Se for usuário do Google e está tentando trocar email, retornar erro
        if (isGoogle && email !== session.user.email) {
            return NextResponse.json(
                { error: 'Usuários que fizeram login com Google não podem alterar o email' },
                { status: 400 }
            )
        }

        let emailChanged = false

        // Verificar se email já está em uso por outro usuário
        if (email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            })

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json(
                    { error: 'Este email já está sendo usado por outro usuário' },
                    { status: 400 }
                )
            }

            emailChanged = true
        }

        // Atualizar usuário
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || session.user.name,
                email: email || session.user.email,
                image: image || session.user.image,
                // Se o email mudou, marcar emailVerified como false
                ...(emailChanged && { emailVerified: false }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                emailVerified: true,
            }
        })

        // Se o email mudou, enviar email de verificação
        if (emailChanged) {
            try {
                await sendVerificationEmail(updatedUser.email, updatedUser.id)
                console.log('✅ Email de verificação enviado para:', updatedUser.email)
            } catch (emailError) {
                console.error('❌ Erro ao enviar email de verificação:', emailError)
                // Não retornar erro aqui, pois o usuário foi atualizado com sucesso
            }
        }

        return NextResponse.json({
            ...updatedUser,
            emailChanged, // Flag indicando se o email foi alterado
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
