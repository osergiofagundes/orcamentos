"use client";
"use client";
import { LogOut, User, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auh-client";

export function UserProfileCard({ user }: { user: { name: string; email: string; avatar: string } }) {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };
  return (
    <Card className="mb-6 w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <div className="font-bold text-lg">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" /> Perfil
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </Button>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" /> Pro
          </Button>
        </div>
        <Button variant="destructive" className="mt-4 w-full" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </CardContent>
    </Card>
  );
}
