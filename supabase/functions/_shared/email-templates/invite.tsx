/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Text } from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps { siteName: string; siteUrl: string; confirmationUrl: string }

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Te han invitado a Lacer Talonario Digital</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Te han invitado</Heading>
        <Text style={text}>
          Has sido invitado a unirte a{' '}
          <Link href={siteUrl} style={link}><strong>Lacer Talonario Digital</strong></Link>.
          Pulsa el botón para aceptar la invitación y crear tu cuenta.
        </Text>
        <Button style={button} href={confirmationUrl}>Aceptar invitación</Button>
        <Text style={footer}>Si no esperabas esta invitación, puedes ignorar este mensaje.</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#E31937', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#1f2937', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#E31937', textDecoration: 'underline' }
const button = { backgroundColor: '#E31937', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '32px 0 0', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }
