/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma tu email para acceder a {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirma tu cuenta</Heading>
        <Text style={text}>
          ¡Gracias por registrarte en{' '}
          <Link href={siteUrl} style={link}><strong>Lacer Talonario Digital</strong></Link>!
        </Text>
        <Text style={text}>
          Confirma tu email ({recipient}) pulsando el botón de abajo para activar tu cuenta:
        </Text>
        <Button style={button} href={confirmationUrl}>Confirmar email</Button>
        <Text style={text}>
          O copia este enlace en tu navegador:<br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Text style={footer}>
          Si no creaste esta cuenta, puedes ignorar este mensaje sin problema.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#E31937', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#1f2937', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#E31937', textDecoration: 'underline' }
const button = {
  backgroundColor: '#E31937', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const,
  borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#6b7280', margin: '32px 0 0', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }
