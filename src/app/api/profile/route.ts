import { NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from 'next/headers'

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
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || session.user.name,
                email: email || session.user.email,
                image: image || session.user.image,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
