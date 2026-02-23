import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const APP_URL = "https://lacertalonariodigital.lovable.app";
const LOGO_URL = "https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones/email-assets/lacer-logo-bocas_sanas.jpg";

const generateOnboardingHTML = (recipientName: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido al Talonario Digital Lacer</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
<tr><td align="center">

<!-- Main container -->
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background-color:#ffffff;padding:28px 40px 16px 40px;border-bottom:4px solid #E31937;">
      <img src="${LOGO_URL}" alt="Lacer - Bocas Sanas" width="220" style="display:block;max-width:220px;height:auto;" />
    </td>
  </tr>

  <!-- Hero Banner -->
  <tr>
    <td style="background:linear-gradient(135deg,#E31937 0%,#b91c30 100%);padding:40px;text-align:center;">
      <h1 style="color:#ffffff;font-size:26px;margin:0 0 8px 0;font-weight:700;letter-spacing:-0.5px;">
        ¡Bienvenido al Talonario Digital!
      </h1>
      <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:0;line-height:1.5;">
        Tu herramienta para crear y enviar recetas digitales a tus pacientes
      </p>
    </td>
  </tr>

  <!-- Saludo -->
  <tr>
    <td style="padding:32px 40px 16px 40px;">
      <p style="font-size:16px;color:#333;margin:0 0 12px 0;line-height:1.6;">
        Hola <strong>${recipientName}</strong>,
      </p>
      <p style="font-size:15px;color:#555;margin:0;line-height:1.6;">
        Gracias por unirte al <strong>Talonario Digital Lacer</strong>. Esta plataforma te permite gestionar 
        electrónicamente las recetas de productos Lacer para tus pacientes, de forma simplificada, 
        mediante envío directo por <strong>WhatsApp</strong> o <strong>Email</strong>.
      </p>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 40px;">
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" />
    </td>
  </tr>

  <!-- Section: Cómo funciona -->
  <tr>
    <td style="padding:8px 40px 24px 40px;">
      <h2 style="font-size:20px;color:#E31937;margin:0 0 20px 0;font-weight:700;">
        📋 ¿Cómo funciona?
      </h2>

      <!-- Paso 1 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="56" valign="top">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#E31937,#b91c30);border-radius:50%;text-align:center;line-height:48px;color:#fff;font-size:20px;font-weight:700;">1</div>
          </td>
          <td style="padding-left:16px;" valign="top">
            <h3 style="font-size:16px;color:#222;margin:0 0 4px 0;font-weight:600;">Selecciona los productos</h3>
            <p style="font-size:14px;color:#666;margin:0;line-height:1.5;">
              Navega por el catálogo completo de productos Lacer organizados por categorías 
              (Lacer, Lacer Infantil, Lacer Aligner, etc.) y selecciona los que necesita tu paciente. 
              Puedes ajustar cantidades con un simple toque.
            </p>
          </td>
        </tr>
      </table>

      <!-- Paso 2 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="56" valign="top">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#E31937,#b91c30);border-radius:50%;text-align:center;line-height:48px;color:#fff;font-size:20px;font-weight:700;">2</div>
          </td>
          <td style="padding-left:16px;" valign="top">
            <h3 style="font-size:16px;color:#222;margin:0 0 4px 0;font-weight:600;">Personaliza la receta</h3>
            <p style="font-size:14px;color:#666;margin:0;line-height:1.5;">
              Indica el nombre del paciente y añade notas o instrucciones específicas. 
              También puedes usar el <strong>dictado por voz</strong> 🎤 para escribir las notas cómodamente.
            </p>
          </td>
        </tr>
      </table>

      <!-- Paso 3 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="56" valign="top">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#E31937,#b91c30);border-radius:50%;text-align:center;line-height:48px;color:#fff;font-size:20px;font-weight:700;">3</div>
          </td>
          <td style="padding-left:16px;" valign="top">
            <h3 style="font-size:16px;color:#222;margin:0 0 4px 0;font-weight:600;">Envía al paciente</h3>
            <p style="font-size:14px;color:#666;margin:0;line-height:1.5;">
              Comparte la receta por <strong>WhatsApp</strong>, <strong>Email</strong> o descárgala como <strong>PDF</strong>. 
              El paciente recibe un enlace con la receta digital que incluye códigos de barras EAN 
              y vídeos explicativos de uso de cada producto.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 40px;">
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:4px 0 20px 0;" />
    </td>
  </tr>

  <!-- Section: Funcionalidades clave -->
  <tr>
    <td style="padding:0 40px 24px 40px;">
      <h2 style="font-size:20px;color:#E31937;margin:0 0 20px 0;font-weight:700;">
        ⭐ Funcionalidades clave
      </h2>

      <!-- Feature Grid -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" valign="top" style="padding-right:8px;padding-bottom:16px;">
            <div style="background:#fef2f2;border-radius:10px;padding:20px;border-left:4px solid #E31937;height:100%;">
              <div style="font-size:24px;margin-bottom:8px;">📱</div>
              <h4 style="font-size:14px;color:#222;margin:0 0 4px 0;font-weight:600;">App Móvil</h4>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.4;">Instálala en tu móvil como una app nativa. Funciona desde cualquier dispositivo.</p>
            </div>
          </td>
          <td width="50%" valign="top" style="padding-left:8px;padding-bottom:16px;">
            <div style="background:#fef2f2;border-radius:10px;padding:20px;border-left:4px solid #E31937;height:100%;">
              <div style="font-size:24px;margin-bottom:8px;">👥</div>
              <h4 style="font-size:14px;color:#222;margin:0 0 4px 0;font-weight:600;">Gestión de Pacientes</h4>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.4;">Guarda tus pacientes y accede a su historial de recetas en cualquier momento.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td width="50%" valign="top" style="padding-right:8px;padding-bottom:16px;">
            <div style="background:#fef2f2;border-radius:10px;padding:20px;border-left:4px solid #E31937;height:100%;">
              <div style="font-size:24px;margin-bottom:8px;">🎤</div>
              <h4 style="font-size:14px;color:#222;margin:0 0 4px 0;font-weight:600;">Dictado por Voz</h4>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.4;">Dicta las notas de la receta con tu voz. Ideal para agilizar la consulta.</p>
            </div>
          </td>
          <td width="50%" valign="top" style="padding-left:8px;padding-bottom:16px;">
            <div style="background:#fef2f2;border-radius:10px;padding:20px;border-left:4px solid #E31937;height:100%;">
              <div style="font-size:24px;margin-bottom:8px;">🎬</div>
              <h4 style="font-size:14px;color:#222;margin:0 0 4px 0;font-weight:600;">Vídeos de Producto</h4>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.4;">Cada receta incluye vídeos explicativos para que el paciente sepa cómo usar cada producto.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td width="50%" valign="top" style="padding-right:8px;padding-bottom:16px;">
            <div style="background:#fef2f2;border-radius:10px;padding:20px;border-left:4px solid #E31937;height:100%;">
              <div style="font-size:24px;margin-bottom:8px;">📊</div>
              <h4 style="font-size:14px;color:#222;margin:0 0 4px 0;font-weight:600;">Estadísticas</h4>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.4;">Consulta las recetas generadas, los productos más recomendados y las tendencias de tu clínica.</p>
            </div>
          </td>
          <td width="50%" valign="top" style="padding-left:8px;padding-bottom:16px;">
            <div style="background:#fef2f2;border-radius:10px;padding:20px;border-left:4px solid #E31937;height:100%;">
              <div style="font-size:24px;margin-bottom:8px;">📄</div>
              <h4 style="font-size:14px;color:#222;margin:0 0 4px 0;font-weight:600;">PDF Profesional</h4>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.4;">Genera recetas en PDF con códigos de barras, QR y tu logotipo de clínica.</p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 40px;">
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:4px 0 20px 0;" />
    </td>
  </tr>

  <!-- Section: Beneficio paciente -->
  <tr>
    <td style="padding:0 40px 24px 40px;">
      <h2 style="font-size:20px;color:#E31937;margin:0 0 16px 0;font-weight:700;">
        🏥 ¿Qué recibe tu paciente?
      </h2>
      <div style="background:linear-gradient(135deg,#fff5f5,#ffffff);border:1px solid #fecaca;border-radius:10px;padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="36" valign="top" style="padding-right:12px;">
              <div style="color:#E31937;font-size:18px;">✅</div>
            </td>
            <td style="padding-bottom:10px;">
              <p style="font-size:14px;color:#444;margin:0;line-height:1.5;">
                <strong>Receta digital interactiva</strong> con nombre de los productos, imágenes y cantidades
              </p>
            </td>
          </tr>
          <tr>
            <td width="36" valign="top" style="padding-right:12px;">
              <div style="color:#E31937;font-size:18px;">✅</div>
            </td>
            <td style="padding-bottom:10px;">
              <p style="font-size:14px;color:#444;margin:0;line-height:1.5;">
                <strong>Códigos de barras EAN</strong> para facilitar la búsqueda en farmacia
              </p>
            </td>
          </tr>
          <tr>
            <td width="36" valign="top" style="padding-right:12px;">
              <div style="color:#E31937;font-size:18px;">✅</div>
            </td>
            <td style="padding-bottom:10px;">
              <p style="font-size:14px;color:#444;margin:0;line-height:1.5;">
                <strong>Vídeos explicativos</strong> de uso de cada producto recomendado
              </p>
            </td>
          </tr>
          <tr>
            <td width="36" valign="top" style="padding-right:12px;">
              <div style="color:#E31937;font-size:18px;">✅</div>
            </td>
            <td>
              <p style="font-size:14px;color:#444;margin:0;line-height:1.5;">
                <strong>Notas personalizadas</strong> del profesional con instrucciones de uso
              </p>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

  <!-- CTA Button -->
  <tr>
    <td style="padding:8px 40px 32px 40px;text-align:center;">
      <a href="${APP_URL}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#E31937,#b91c30);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(227,25,55,0.35);">
        Acceder al Talonario Digital →
      </a>
      <p style="font-size:13px;color:#999;margin:16px 0 0 0;">
        Accede desde cualquier navegador o instala la app en tu móvil
      </p>
    </td>
  </tr>

  <!-- Quick start tip -->
  <tr>
    <td style="padding:0 40px 32px 40px;">
      <div style="background:#f8f8f8;border-radius:10px;padding:24px;border-left:4px solid #E31937;">
        <h3 style="font-size:15px;color:#222;margin:0 0 8px 0;font-weight:600;">💡 Consejo rápido para empezar</h3>
        <p style="font-size:14px;color:#555;margin:0;line-height:1.5;">
          Al entrar por primera vez, ve a tu <strong>Perfil</strong> (icono de usuario) y rellena tus datos de clínica. 
          Así tus recetas aparecerán personalizadas con el nombre de tu consulta y tu número de colegiado.
        </p>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="Lacer" width="140" style="display:inline-block;max-width:140px;height:auto;margin-bottom:12px;opacity:0.9;" />
      <p style="font-size:12px;color:#999;margin:0 0 4px 0;line-height:1.5;">
        Talonario Digital Lacer — Recetas inteligentes para profesionales de la salud bucodental
      </p>
      <p style="font-size:11px;color:#666;margin:0;">
        © ${new Date().getFullYear()} Lacer. Todos los derechos reservados.
      </p>
    </td>
  </tr>

</table>
<!-- End main container -->

</td></tr>
</table>
<!-- End wrapper -->

</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, recipientName } = await req.json();

    if (!to || !recipientName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, recipientName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = generateOnboardingHTML(recipientName);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Talonario Digital Lacer <onboarding@resend.dev>',
        to: [to],
        subject: '🦷 Bienvenido al Talonario Digital Lacer — Tu guía de inicio',
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
