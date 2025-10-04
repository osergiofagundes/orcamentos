import { betterAuth } from "better-auth";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { EmailVerificationEmail } from "@/emails/email-verification-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Permitir login mesmo sem verificação
    },
    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 60 * 60 * 24, // 24 horas
        sendVerificationEmail: async ({ user, url, token }) => {
            try {
                console.log(`📧 Enviando email de verificação para: ${user.email}`);
                console.log(`🔗 URL de verificação: ${url}`);
                
                if (!process.env.RESEND_API_KEY) {
                    console.error('❌ RESEND_API_KEY não configurada!');
                    throw new Error('RESEND_API_KEY não configurada');
                }

                const emailHtml = await render(EmailVerificationEmail({
                    userEmail: user.email,
                    verificationUrl: url,
                }));

                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'noreply@skyorcamentos.com',
                    to: user.email,
                    subject: 'Verificar email - Sky Orçamentos',
                    html: emailHtml,
                });

                console.log('✅ Email de verificação enviado com sucesso');
            } catch (error) {
                console.error('❌ Erro ao enviar email de verificação:', error);
                throw error;
            }
        },
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});