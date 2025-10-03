import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasRecaptchaSecret: !!process.env.RECAPTCHA_SECRET_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    recaptchaSecretLength: process.env.RECAPTCHA_SECRET_KEY?.length || 0,
    timestamp: new Date().toISOString(),
  })
}