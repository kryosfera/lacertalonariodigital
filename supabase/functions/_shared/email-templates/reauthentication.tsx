/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones/email-assets/lacer-logo-bocas_sanas.jpg'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación del Talonario Digital Lacer</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} alt="Lacer - Bocas Sanas" width="200" style={logo} />
        </Section>
        <Section style={hero}>
          <Heading style={h1}>Código de verificación</Heading>
          <Text style={heroText}>Talonario Digital Lacer</Text>
        </Section>
        <Section style={bodyS}>
          <Text style={text}>Usa el siguiente código para confirmar tu identidad:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={textSmall}>
            Este código caducará en breve. Si no has solicitado esta acción, ignora este mensaje.
          </Text>
        </Section>
        <Section style={footer}>
          <Text style={footerText}>Talonario Digital Lacer</Text>
          <Text style={footerSmall}>© {new Date().getFullYear()} Lacer. Todos los derechos reservados.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif', margin: 0, padding: '32px 16px' }
const container = { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const header = { backgroundColor: '#ffffff', padding: '28px 40px 16px', borderBottom: '4px solid #E31937' }
const logo = { display: 'block', maxWidth: '200px', height: 'auto' }
const hero = { background: 'linear-gradient(135deg,#E31937 0%,#b91c30 100%)', padding: '36px 40px', textAlign: 'center' as const }
const h1 = { color: '#ffffff', fontSize: '26px', margin: '0 0 8px', fontWeight: 700 as const, letterSpacing: '-0.5px' }
const heroText = { color: 'rgba(255,255,255,0.9)', fontSize: '15px', margin: 0 }
const bodyS = { padding: '32px 40px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '13px', color: '#888', lineHeight: '1.5', margin: '24px 0 0' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 700 as const, color: '#E31937', letterSpacing: '6px', margin: '24px 0', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }
const footer = { backgroundColor: '#1a1a1a', padding: '24px 40px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#bbb', margin: '0 0 4px' }
const footerSmall = { fontSize: '11px', color: '#777', margin: 0 }
