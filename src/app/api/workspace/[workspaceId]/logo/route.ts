import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId: workspaceIdString } = await context.params
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const workspaceId = parseInt(workspaceIdString)

    // Verificar se o usuário tem permissão para editar o workspace
    const userWorkspace = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: workspaceId,
        nivel_permissao: { gte: 2 } // Assuming level 2+ can edit
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Sem permissão para editar este workspace' }, { status: 403 })
    }

    const data = await request.formData()
    const file: File | null = data.get('logo') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou SVG.' 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Criar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `workspace-${workspaceId}-logo-${timestamp}.${extension}`
    
    // Garantir que o diretório existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    
    try {
      await writeFile(path.join(uploadDir, filename), buffer)
    } catch (error) {
      // Se não conseguir escrever, provavelmente o diretório não existe
      // Criar o diretório e tentar novamente
      const fs = await import('fs/promises')
      await fs.mkdir(uploadDir, { recursive: true })
      await writeFile(path.join(uploadDir, filename), buffer)
    }

    const logoUrl = `/uploads/logos/${filename}`

    // Atualizar o workspace com a URL do logo
    const updatedWorkspace = await prisma.areaTrabalho.update({
      where: { id: workspaceId },
      data: { logo_url: logoUrl }
    })

    return NextResponse.json({ 
      logoUrl,
      message: 'Logo carregado com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Permitir DELETE para remover o logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId: workspaceIdString } = await params
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const workspaceId = parseInt(workspaceIdString)

    // Verificar permissão
    const userWorkspace = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: workspaceId,
        nivel_permissao: { gte: 2 }
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Sem permissão para editar este workspace' }, { status: 403 })
    }

    // Remover o logo do workspace
    await prisma.areaTrabalho.update({
      where: { id: workspaceId },
      data: { logo_url: null }
    })

    return NextResponse.json({ message: 'Logo removido com sucesso!' })

  } catch (error) {
    console.error('Erro ao remover logo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
