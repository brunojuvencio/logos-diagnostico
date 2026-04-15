/**
 * POST /api/tracking/ga4
 *
 * Proxy server-side para o GA4 Measurement Protocol.
 * Recebe eventos do browser e encaminha para o GA4.
 * Segredos (api_secret) nunca expostos ao client.
 *
 * Eventos suportados: page_view, view_item, generate_lead, contact, sign_up
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendGA4Event } from '@/lib/server/ga4-mp'

const ALLOWED_EVENTS = new Set([
  'page_view',
  'view_item',
  'generate_lead',
  'contact',
  'sign_up',
])

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

  const { eventName, clientId, params, sessionId } = body as Record<string, unknown>

  // Validação mínima
  if (typeof eventName !== 'string' || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: 'eventName inválido.' }, { status: 422 })
  }
  if (typeof clientId !== 'string' || clientId.trim() === '') {
    return NextResponse.json({ error: 'clientId obrigatório.' }, { status: 422 })
  }

  const result = await sendGA4Event({
    eventName: eventName as string,
    clientId:  clientId as string,
    sessionId: typeof sessionId === 'string' ? sessionId : undefined,
    params:    typeof params === 'object' && params !== null
      ? (params as Record<string, unknown>)
      : undefined,
  })

  if (!result.ok && result.error === 'not_configured') {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 200 })
  }

  return NextResponse.json({ ok: result.ok }, { status: 200 })
}
