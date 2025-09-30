import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// GET /api/workspace/trash - Listar workspaces na lixeira
export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const trashedWorkspaces = await prisma.areaTrabalho.findMany({
            where: {
                usuariosAreas: {
                    some: {
                        usuario_id: session.user.id
                    }
                },
                inTrash: true // Apenas workspaces na lixeira
            },
            select: {
                id: true,
                nome: true,
                cpf_cnpj: true,
                telefone: true,
                email: true,
                endereco: true,
                bairro: true,
                cidade: true,
                estado: true,
                cep: true,
                logo_url: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                inTrash: true,
                trashedAt: true,
                trashedBy: true,
                usuariosAreas: {
                    where: {
                        usuario_id: session.user.id
                    },
                    select: {
                        nivel_permissao: true
                    }
                },
                usuarioQueMoveuParaLixeira: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                trashedAt: 'desc' // Ordenar pelos mais recentemente movidos para lixeira
            }
        })

        return NextResponse.json(trashedWorkspaces)
    } catch (error) {
        console.error('Error fetching trashed workspaces:', error)
        return NextResponse.json(
            { error: 'Failed to fetch trashed workspaces' },
            { status: 500 }
        )
    }
}