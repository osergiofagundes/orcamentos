import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params
    
    // Validar o nome do arquivo para evitar path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Invalid filename', { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'logos', filename)
    
    try {
      const file = await readFile(filePath)
      
      // Determinar o tipo de conteúdo baseado na extensão
      const ext = path.extname(filename).toLowerCase()
      let contentType = 'image/jpeg'
      
      switch (ext) {
        case '.png':
          contentType = 'image/png'
          break
        case '.webp':
          contentType = 'image/webp'
          break
        case '.svg':
          contentType = 'image/svg+xml'
          break
        case '.gif':
          contentType = 'image/gif'
          break
        default:
          contentType = 'image/jpeg'
      }

      return new Response(new Uint8Array(file), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch (error) {
      return new NextResponse('File not found', { status: 404 })
    }
  } catch (error) {
    console.error('Erro ao servir imagem:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
