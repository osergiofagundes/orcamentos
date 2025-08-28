import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";

type Workspace = {
  id: number
  nome: string
  logo_url?: string | null
}

type User = {
  name: string
  email: string
  avatar: string
}

export async function WorkspaceAppSidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let workspaces: Workspace[] = [];
  let user: User = {
    name: "Usuário",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  };

  if (session?.user?.id) {
    try {
      // Buscar dados do usuário
      const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          image: true,
        },
      });

      if (userData) {
        user = {
          name: userData.name || "Usuário",
          email: userData.email,
          avatar: userData.image || "/avatars/default.jpg",
        };
      }

      const userWorkspaces = await prisma.usuarioAreaTrabalho.findMany({
        where: {
          usuario_id: session.user.id,
        },
        include: {
          areaTrabalho: {
            select: {
              id: true,
              nome: true,
              logo_url: true,
            },
          },
        },
      });

      workspaces = userWorkspaces.map((uw) => ({
        id: uw.areaTrabalho.id,
        nome: uw.areaTrabalho.nome,
        logo_url: uw.areaTrabalho.logo_url,
      }));
    } catch (error) {
      console.error("Failed to fetch user data or workspaces:", error);
    }
  }

  return <AppSidebar workspaces={workspaces} user={user} />;
}
