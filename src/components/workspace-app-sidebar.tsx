import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { withDatabaseErrorHandling, isDatabaseQuotaError } from "@/lib/database-error-handler";

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
  let session = null;
  let workspaces: Workspace[] = [];
  let user: User = {
    name: "Usuário",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  };

  // Try to get session with database error handling
  const sessionResult = await withDatabaseErrorHandling(
    async () => {
      return await auth.api.getSession({
        headers: await headers(),
      });
    },
    null
  );

  if (sessionResult.isQuotaError) {
    console.warn("Database quota exceeded - returning fallback sidebar");
    return <AppSidebar workspaces={[]} user={user} />;
  }

  session = sessionResult.data;

  if (session?.user?.id) {
    // Fetch user data
    const userResult = await withDatabaseErrorHandling(
      async () => {
        return await prisma.user.findUnique({
          where: { id: session!.user.id },
          select: {
            name: true,
            email: true,
            image: true,
          },
        });
      },
      null
    );

    // Fetch user workspaces
    const workspacesResult = await withDatabaseErrorHandling(
      async () => {
        return await prisma.usuarioAreaTrabalho.findMany({
          where: {
            usuario_id: session!.user.id,
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
      },
      []
    );

    // Handle results
    if (userResult.isQuotaError || workspacesResult.isQuotaError) {
      console.warn("Database quota exceeded - using session data for fallback");
      // Use session data for basic user info when database is unavailable
      if (session?.user) {
        user = {
          name: session.user.name || "Usuário",
          email: session.user.email || "user@example.com", 
          avatar: session.user.image || "/avatars/default.jpg",
        };
      }
      // Return empty workspaces when quota exceeded
      workspaces = [];
    } else {
      // Normal case - use database data
      if (userResult.success && userResult.data) {
        user = {
          name: userResult.data.name || "Usuário",
          email: userResult.data.email,
          avatar: userResult.data.image || "/avatars/default.jpg",
        };
      }

      if (workspacesResult.success && workspacesResult.data) {
        workspaces = workspacesResult.data.map((uw) => ({
          id: uw.areaTrabalho.id,
          nome: uw.areaTrabalho.nome,
          logo_url: uw.areaTrabalho.logo_url,
        }));
      }
    }
  }

  return <AppSidebar workspaces={workspaces} user={user} />;
}
