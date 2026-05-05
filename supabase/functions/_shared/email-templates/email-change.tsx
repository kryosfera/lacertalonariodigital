/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Text } from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma el cambio de email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirma el cambio de email</Heading>
        <Text style={text}>
          Has solicitado cambiar tu email de <strong>{oldEmail}</strong> a <strong>{newEmail}</strong>.
        </Text>
        <Button style={button} href={confirmationUrl}>Confirmar cambio</Button>
        <Text style={footer}>Si no solicitaste este cambio, protege tu cuenta inmediatamente.</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#E31937', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#1f2937', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#E31937', textDecoration: 'underline' }
const button = { backgroundColor: '#E31937', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '32px 0 0', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }
