/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

const LOGO_URL = 'https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones/email-assets/lacer-logo-bocas_sanas.jpg'

export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma el cambio de email en {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} alt="Lacer - Bocas Sanas" width="200" style={logo} />
        </Section>
        <Section style={hero}>
          <Heading style={h1}>Confirmar cambio de email</Heading>
          <Text style={heroText}>Talonario Digital Lacer</Text>
        </Section>
        <Section style={bodyS}>
          <Text style={text}>Hola,</Text>
          <Text style={text}>
            Has solicitado cambiar tu dirección de email de <strong>{oldEmail}</strong> a <strong>{newEmail}</strong>.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button style={button} href={confirmationUrl}>Confirmar cambio</Button>
          </Section>
          <Text style={textSmall}>
            Si no has solicitado este cambio, protege tu cuenta inmediatamente cambiando tu contraseña.
          </Text>
        </Section>
        <Section style={footer}>
          <Text style={footerText}>Talonario Digital Lacer — {siteName}</Text>
          <Text style={footerSmall}>© {new Date().getFullYear()} Lacer. Todos los derechos reservados.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif', margin: 0, padding: '32px 16px' }
const container = { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const header = { backgroundColor: '#ffffff', padding: '28px 40px 16px', borderBottom: '4px solid #E31937' }
const logo = { display: 'block', maxWidth: '200px', height: 'auto' }
const hero = { background: 'linear-gradient(135deg,#E31937 0%,#b91c30 100%)', padding: '36px 40px', textAlign: 'center' as const }
const h1 = { color: '#ffffff', fontSize: '26px', margin: '0 0 8px', fontWeight: 700 as const, letterSpacing: '-0.5px' }
const heroText = { color: 'rgba(255,255,255,0.9)', fontSize: '15px', margin: 0 }
const bodyS = { padding: '32px 40px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '13px', color: '#888', lineHeight: '1.5', margin: '24px 0 0', textAlign: 'center' as const }
const button = { backgroundColor: '#E31937', color: '#ffffff', fontSize: '16px', fontWeight: 700 as const, borderRadius: '8px', padding: '16px 36px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(227,25,55,0.35)' }
const footer = { backgroundColor: '#1a1a1a', padding: '24px 40px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#bbb', margin: '0 0 4px' }
const footerSmall = { fontSize: '11px', color: '#777', margin: 0 }
