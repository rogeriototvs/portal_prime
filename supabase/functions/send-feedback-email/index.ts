// Supabase Edge Function: send-feedback-email
// Sends client feedback to fluig.prime@fluig.com (requires external email provider).

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

type FeedbackKind = 'complaint' | 'compliment';

type Payload = {
  id: string;
  t_code: string;
  kind: FeedbackKind;
  subject: string | null;
  message: string;
  contact_email: string | null;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!payload?.t_code || !payload?.kind || !payload?.message) {
    return json({ error: 'Missing required fields' }, 400);
  }

  // Optional: validate t_code exists/active using service role (recommended).
  // If you don't provide SUPABASE_SERVICE_ROLE_KEY, this step is skipped.
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && serviceRoleKey) {
    try {
      const resp = await fetch(`${supabaseUrl}/rest/v1/authorized_codes?select=t_code,is_active&t_code=eq.${encodeURIComponent(payload.t_code)}`,
        {
          headers: {
            apikey: serviceRoleKey,
            authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );
      if (!resp.ok) return json({ error: 'Code validation failed' }, 400);
      const rows = (await resp.json()) as Array<{ t_code: string; is_active: boolean | null }>;
      if (!rows?.[0]?.t_code || rows[0].is_active !== true) {
        return json({ error: 'Invalid or inactive code' }, 400);
      }
    } catch {
      return json({ error: 'Code validation failed' }, 400);
    }
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    return json({
      error: 'Email provider not configured',
      hint: 'Set RESEND_API_KEY (and configure a verified sender) to enable emails.',
    }, 501);
  }

  const kindLabel = payload.kind === 'complaint' ? 'Reclamação' : 'Elogio';
  const subject = `[Portal Prime] ${kindLabel}${payload.subject ? ` - ${payload.subject}` : ''} (Código ${payload.t_code})`;
  const body = [
    `Tipo: ${kindLabel}`,
    `Código: ${payload.t_code}`,
    payload.contact_email ? `Contato: ${payload.contact_email}` : null,
    payload.id ? `ID: ${payload.id}` : null,
    '',
    payload.message,
  ].filter(Boolean).join('\n');

  // Resend API (https://resend.com)
  // You MUST set a verified "from" address in RESEND_FROM.
  const from = Deno.env.get('RESEND_FROM');
  if (!from) {
    return json({
      error: 'Missing RESEND_FROM',
      hint: 'Set RESEND_FROM to a verified sender (e.g. no-reply@yourdomain.com).',
    }, 501);
  }

  const emailResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${resendKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: ['fluig.prime@fluig.com'],
      subject,
      text: body,
    }),
  });

  if (!emailResp.ok) {
    const text = await emailResp.text();
    return json({ error: 'Failed to send email', details: text }, 502);
  }

  return json({ ok: true });
});
