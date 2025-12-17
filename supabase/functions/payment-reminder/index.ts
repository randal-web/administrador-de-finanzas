import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const CRON_SECRET = Deno.env.get('CRON_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Check for cron secret
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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

    const emailsToSend = []
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize to start of day for accurate comparison

    // 3. Iterar y buscar pagos próximos o vencidos
    for (const sub of subscriptions || []) {
      // Obtener email del usuario
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(sub.user_id)
      
      if (userError || !user || !user.email) continue

      const dueDay = sub.due_day || 1;
      const currentMonthDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      currentMonthDueDate.setHours(0, 0, 0, 0);

      let isPaidThisMonth = false;
      if (sub.last_payment_date) {
        const lastPayment = new Date(sub.last_payment_date);
        // Check if paid for the current month/cycle
        isPaidThisMonth = lastPayment.getMonth() === today.getMonth() && lastPayment.getFullYear() === today.getFullYear();
      }

      // Case 1: Overdue (Date passed AND not paid)
      if (currentMonthDueDate < today && !isPaidThisMonth) {
        const diffTime = today.getTime() - currentMonthDueDate.getTime();
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        emailsToSend.push({
          from: 'Finanzas App <alertas@notifications.globalmanager.online>',
          to: user.email,
          subject: `⚠️ URGENTE: Pago Vencido - ${sub.name}`,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
          },
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
              <div style="background-color: #ef4444; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Pago Vencido</h1>
              </div>
              
              <div style="padding: 30px; color: #334155;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
                
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                  Tu pago para <strong>${sub.name}</strong> ha vencido hace <strong>${daysOverdue} días</strong>.
                </p>
                
                <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #fee2e2;">
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b; text-align: center;">
                    Monto Pendiente: $${sub.amount}
                  </p>
                  <p style="margin: 10px 0 0; font-size: 14px; color: #b91c1c; text-align: center;">
                    Fecha límite era: ${currentMonthDueDate.toLocaleDateString('es-ES')}
                  </p>
                </div>

                <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">
                  Por favor, registra tu pago en la aplicación lo antes posible.
                </p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  Mantén tus finanzas bajo control con tu Administrador de Finanzas.
                </p>
              </div>
            </div>
          `
        });
        continue; // Skip upcoming check if overdue
      }

      // Case 2: Upcoming (Only if not paid yet)
      if (!isPaidThisMonth && currentMonthDueDate >= today) {
        const timeDiff = currentMonthDueDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Si faltan 3 días o menos
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
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a; text-align: center;">
                      ${sub.name}
                    </p>
                    <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #2563eb; text-align: center;">
                      $${sub.amount}
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; color: #64748b; text-align: center;">
                      Vence el: ${currentMonthDueDate.toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">
                    Si ya realizaste este pago, por favor regístralo en la aplicación.
                  </p>
                </div>
                
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                    Mantén tus finanzas bajo control con tu Administrador de Finanzas.
                  </p>
                </div>
              </div>
            `
          });
        }
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