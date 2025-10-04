import { prisma } from "@/lib/prisma"

/**
 * Verifica se o usuário fez login com Google
 * @param userId - ID do usuário
 * @returns true se o usuário fez login com Google, false caso contrário
 */
export async function isGoogleUser(userId: string): Promise<boolean> {
  try {
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        providerId: "google",
      },
    })

    return !!googleAccount
  } catch (error) {
    console.error("Erro ao verificar se usuário é do Google:", error)
    return false
  }
}

/**
 * Verifica se o usuário precisa confirmar o email
 * @param userId - ID do usuário
 * @returns true se o usuário não é do Google e não verificou o email, false caso contrário
 */
export async function needsEmailVerification(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    })

    if (!user) return false

    // Se o usuário é do Google, não precisa verificar email
    const isGoogle = await isGoogleUser(userId)
    if (isGoogle) return false

    // Se não é do Google e o email não está verificado, precisa verificar
    return !user.emailVerified
  } catch (error) {
    console.error("Erro ao verificar necessidade de verificação de email:", error)
    return false
  }
}