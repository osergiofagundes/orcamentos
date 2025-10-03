"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

interface ReCaptchaProps {
  onVerify?: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
}

export interface ReCaptchaRef {
  reset: () => void
  executeAsync: () => Promise<string | null>
}

export const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>(
  ({ onVerify, onExpired, onError }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null)
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset()
      },
      executeAsync: async () => {
        return recaptchaRef.current?.executeAsync() || null
      }
    }))

    if (!siteKey) {
      console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY não encontrada nas variáveis de ambiente')
      return null
    }

    return (
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={onVerify}
        onExpired={onExpired}
        onError={onError}
        size="normal"
        theme="light"
      />
    )
  }
)

ReCaptcha.displayName = "ReCaptcha"