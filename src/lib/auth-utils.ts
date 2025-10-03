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