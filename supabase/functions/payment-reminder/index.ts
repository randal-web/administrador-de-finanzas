import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Inicializar cliente de Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    // 2. Obtener todas las suscripciones junto con el email del usuario
    // Nota: Esto asume que tienes una relación foreign key o que puedes unir con auth.users
    // Como auth.users es protegido, a veces es mejor tener una tabla 'profiles' o 'users_public'
    // O usar el admin client para listar usuarios si son pocos.
    // Para simplificar, asumiremos que el email está accesible o consultaremos auth.users con service_role key si fuera necesario.
    
    // IMPORTANTE: Para acceder a datos de usuarios (emails), necesitamos el SERVICE_ROLE_KEY
    // porque el cliente anónimo no puede leer la tabla de usuarios de auth.
    // Nota: Usamos 'SERVICE_ROLE_KEY' porque Supabase no permite secretos que empiecen con 'SUPABASE_'
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')
    const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!)

    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, user_id')
    
    if (subError) throw subError

    const today = new Date().getDate()
    const emailsToSend = []

    // 3. Iterar y buscar pagos próximos (3 días antes)
    for (const sub of subscriptions || []) {
      // Obtener email del usuario
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(sub.user_id)
      
      if (userError || !user || !user.email) continue

      let daysRemaining = sub.due_day - today
      
      // Ajuste simple para cambio de mes (ej: hoy es 28, vence el 2)
      if (daysRemaining < 0) {
         daysRemaining += 30 // Aproximación
      }

      // Si faltan 3 días o menos (y no es negativo/vencido hace mucho)
      if (daysRemaining <= 3 && daysRemaining >= 0) {
        emailsToSend.push({
          from: 'Finanzas App <alertas@notifications.globalmanager.online>',
          to: user.email,
          subject: `🔔 Recordatorio: ${sub.name} vence pronto`,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
          },
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
              <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Recordatorio de Pago</h1>
              </div>
              
              <div style="padding: 30px; color: #334155;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
                
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                  Este es un recordatorio amigable de que tienes un pago programado que vence pronto.
                </p>
                
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Servicio</td>
                      <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right; font-size: 16px;">${sub.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Monto</td>
                      <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right; font-size: 16px;">$${sub.amount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Vencimiento</td>
                      <td style="padding: 8px 0; color: #ef4444; font-weight: bold; text-align: right; font-size: 16px;">
                        ${daysRemaining === 0 ? '¡Vence HOY!' : `En ${daysRemaining} día(s)`}
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
                  Mantén tus finanzas bajo control con tu Administrador de Finanzas.
                </p>
              </div>
              
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">Este es un mensaje automático, por favor no responder.</p>
              </div>
            </div>
          `
        })
      }
    }

    // 4. Enviar correos usando Resend (Batch API)
    if (emailsToSend.length > 0) {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailsToSend)
      })

      const data = await res.json()
      return new Response(JSON.stringify({ success: true, sent: emailsToSend.length, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, sent: 0, message: 'No upcoming payments found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})