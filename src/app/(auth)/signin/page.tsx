import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="/images/logo.png" alt='Logo' />
          </Avatar>
          Sky Orçamentos
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
