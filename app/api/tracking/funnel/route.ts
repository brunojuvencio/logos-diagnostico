import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { FunnelEventInsert } from '@/lib/supabase'

const ALLOWED_EVENT_TYPES = new Set(['step_view', 'step_continue', 'submit'])

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>

  if (typeof payload.sessionId !== 'string' || payload.sessionId.trim() === '') {
    return NextResponse.json({ error: 'sessionId obrigatório.' }, { status: 422 })
  }
  if (typeof payload.eventType !== 'string' || !ALLOWED_EVENT_TYPES.has(payload.eventType)) {
    return NextResponse.json({ error: 'eventType inválido.' }, { status: 422 })
  }
  if (typeof payload.stepNumber !== 'number' || payload.stepNumber < 0 || payload.stepNumber > 4) {
    return NextResponse.json({ error: 'stepNumber inválido.' }, { status: 422 })
  }
  if (typeof payload.stepName !== 'string' || payload.stepName.trim() === '') {
    return NextResponse.json({ error: 'stepName obrigatório.' }, { status: 422 })
  }

  const insertPayload: FunnelEventInsert = {
    session_id: payload.sessionId,
    event_type: payload.eventType as FunnelEventInsert['event_type'],
    step_number: payload.stepNumber,
    step_name: payload.stepName.trim(),
    form_name: typeof payload.formName === 'string' ? payload.formName : 'diagnostico',
    page_url: typeof payload.page_url === 'string' ? payload.page_url : null,
    referrer: typeof payload.referrer === 'string' ? payload.referrer : null,
    user_agent: typeof payload.user_agent === 'string' ? payload.user_agent : null,
    utm_source: typeof payload.utm_source === 'string' ? payload.utm_source : null,
    utm_medium: typeof payload.utm_medium === 'string' ? payload.utm_medium : null,
    utm_campaign: typeof payload.utm_campaign === 'string' ? payload.utm_campaign : null,
    utm_term: typeof payload.utm_term === 'string' ? payload.utm_term : null,
    utm_content: typeof payload.utm_content === 'string' ? payload.utm_content : null,
    event_id: typeof payload.eventId === 'string' ? payload.eventId : null,
  }

  const admin = getSupabaseAdmin()
  const { error } = await admin.from('funil_eventos').insert(insertPayload)

  if (error) {
    console.error('[tracking/funnel] Supabase insert error:', error)
    return NextResponse.json({ error: 'Erro ao registrar evento do funil.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
