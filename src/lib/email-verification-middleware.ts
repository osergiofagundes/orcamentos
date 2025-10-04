import { NextResponse } from "next/server"
import { needsEmailVerification } from "./auth-utils"

/**
 * Middleware para verificar se o usuário precisa de verificação de email
 * Retorna erro 403 se precisar verificar
 */
export async function checkEmailVerification(userId: string) {
  const needsVerification = await needsEmailVerification(userId)
  
  if (needsVerification) {
    return NextResponse.json(
      { 
        error: "Email não verificado",
        code: "EMAIL_NOT_VERIFIED",
        message: "Você precisa verificar seu email antes de realizar esta ação" 
      },
      { status: 403 }
    )
  }
  
  return null
}

/**
 * Wrapper para APIs que precisam de verificação de email
 */
export function withEmailVerification(handler: (request: Request, ...args: any[]) => Promise<Response>) {
  return async (request: Request, ...args: any[]) => {
    // Verificar se é um usuário autenticado
    const authHeader = request.headers.get('authorization')
    
    // Se não tem header de autorização, deixar o handler normal lidar com auth
    if (!authHeader) {
      return handler(request, ...args)
    }
    
    // Aqui você adicionaria a lógica para extrair o userId do token/session
    // Por enquanto, vamos deixar o handler original lidar com isso
    return handler(request, ...args)
  }
}