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

interface ResetPasswordEmailProps {
  userEmail?: string
  resetPasswordUrl?: string
}

export const ResetPasswordEmail = ({
  userEmail,
  resetPasswordUrl,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinir senha - Sky Orçamentos</Preview>
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
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={heroText}>
          Olá! Você solicitou a redefinição da sua senha para o Sky Orçamentos.
        </Text>
        <Text style={text}>
          Para redefinir sua senha, clique no botão abaixo. Este link é válido por 1 hora.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={resetPasswordUrl}>
            Redefinir Senha
          </Button>
        </Section>
        <Text style={text}>
          Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.
        </Text>
        <Text style={text}>
          Para sua segurança, este link expirará em 1 hora.
        </Text>
        <Section>
          <Text style={footerText}>
            Este email foi enviado para{' '}
            <Link href={`mailto:${userEmail}`} style={link}>
              {userEmail}
            </Link>
          </Text>
          <Text style={footerText}>
            Sky Orçamentos - Sistema de Gestão de Orçamentos
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ResetPasswordEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const logoContainer = {
  margin: '0 auto',
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#0284c7', // sky-600
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  lineHeight: '42px',
  textAlign: 'center' as const,
}

const heroText = {
  fontSize: '18px',
  lineHeight: '28px',
  marginBottom: '30px',
  color: '#374151', // gray-700
}

const text = {
  color: '#374151', // gray-700
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0284c7', // sky-600
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '0 auto',
}

const link = {
  color: '#0284c7', // sky-600
  textDecoration: 'underline',
}

const footerText = {
  color: '#6b7280', // gray-500
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginTop: '20px',
}