import { Suspense } from 'react'
import { VerifyEmailContent } from './_components'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={
          <div className="text-center">
            <p>Carregando...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}