import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailVerificationEmailProps {
  userEmail?: string
  verificationUrl?: string
}

export const EmailVerificationEmail = ({
  userEmail,
  verificationUrl,
}: EmailVerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verificar email - Sky Orçamentos</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src={`${process.env.NEXT_PUBLIC_URL}/images/logo.png`}
            width="60"
            height="60"
            alt="Sky Orçamentos"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Verificar seu email</Heading>
        <Text style={heroText}>
          Bem-vindo ao Sky Orçamentos! Para começar a usar nossa plataforma, você precisa verificar seu email.
        </Text>
        <Text style={text}>
          Clique no botão abaixo para confirmar seu endereço de email e ativar sua conta:
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationUrl}>
            Verificar Email
          </Button>
        </Section>
        <Text style={text}>
          Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
        </Text>
        <Link href={verificationUrl} style={link}>
          {verificationUrl}
        </Link>
        <Text style={footerText}>
          Se você não se cadastrou no Sky Orçamentos, pode ignorar este email.
        </Text>
      </Container>
    </Body>
  </Html>
)

// Estilos (copiados do reset-password-email.tsx)
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const logoContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 0 40px',
}

const logo = {
  borderRadius: '12px',
  margin: '0 auto',
  display: 'block',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const heroText = {
  fontSize: '18px',
  lineHeight: '28px',
  margin: '30px 0',
  color: '#484848',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#0EA5E9',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
  margin: '0 auto',
}

const link = {
  color: '#0EA5E9',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
  display: 'block' as const,
}

const footerText = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '30px 0 0',
  textAlign: 'center' as const,
}