import { NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// PUT /api/profile/password - Alterar senha do usuário
export async function PUT(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { currentPassword, newPassword } = await req.json()

        // Usar o Better Auth para alterar a senha
        const result = await auth.api.changePassword({
            body: {
                newPassword,
                currentPassword,
            },
            headers: await headers(),
        })

        if (!result) {
            return NextResponse.json(
                { error: 'Erro ao alterar senha. Verifique se a senha atual está correta.' },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: 'Senha alterada com sucesso' })
    } catch (error: any) {
        console.error('Error updating password:', error)
        
        // Tratar erros específicos do Better Auth
        if (error?.message?.includes('Invalid password')) {
            return NextResponse.json(
                { error: 'Senha atual incorreta' },
                { status: 400 }
            )
        }
        
        if (error?.message?.includes('No password')) {
            return NextResponse.json(
                { error: 'Esta conta foi criada via login social e não possui senha.' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Erro interno ao alterar senha' },
            { status: 500 }
        )
    }
}
