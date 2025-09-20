import { GalleryVerticalEnd } from "lucide-react"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { Suspense } from "react"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="/images/logo.png" alt='Logo' />
          </Avatar>
          Sky Orçamentos
        </a>
        <Suspense fallback={<div>Carregando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}