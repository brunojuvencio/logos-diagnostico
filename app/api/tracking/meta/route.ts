/**
 * POST /api/tracking/meta
 *
 * Proxy server-side para a Meta Conversions API.
 * Recebe eventos do browser, adiciona IP e user-agent do servidor,
 * e encaminha para o CAPI. Segredos nunca expostos ao client.
 *
 * Eventos suportados: PageView, ViewContent, Lead, Contact, CompleteRegistration
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendMetaEvent } from '@/lib/server/meta-capi'
import type { MetaUserData } from '@/lib/server/meta-capi'

const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Lead',
  'Contact',
  'CompleteRegistration',
])

function getClientIp(req: NextRequest): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  )
}

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

  const {
    eventName,
    eventId,
    eventSourceUrl,
    email,
    phone,
    firstName,
    fbp,
    fbc,
    customData,
  } = body as Record<string, unknown>

  // Validação mínima
  if (typeof eventName !== 'string' || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: 'eventName inválido.' }, { status: 422 })
  }
  if (typeof eventId !== 'string' || eventId.trim() === '') {
    return NextResponse.json({ error: 'eventId obrigatório.' }, { status: 422 })
  }

  const clientIp        = getClientIp(req)
  const clientUserAgent = req.headers.get('user-agent') ?? undefined

  const userData: MetaUserData = {
    clientIp,
    clientUserAgent,
    fbp: typeof fbp === 'string' ? fbp : undefined,
    fbc: typeof fbc === 'string' ? fbc : undefined,
    email:     typeof email === 'string' && email.trim() ? email : undefined,
    phone:     typeof phone === 'string' && phone.trim() ? phone : undefined,
    firstName: typeof firstName === 'string' && firstName.trim() ? firstName : undefined,
  }

  // Fire and forget — nunca bloqueia resposta ao client
  const result = await sendMetaEvent({
    eventName:      eventName as string,
    eventId:        eventId as string,
    eventSourceUrl: typeof eventSourceUrl === 'string' ? eventSourceUrl : undefined,
    userData,
    customData:     typeof customData === 'object' && customData !== null
      ? (customData as Record<string, unknown>)
      : undefined,
  })

  if (!result.ok && result.error === 'not_configured') {
    // Ambiente sem credenciais configuradas (dev local sem .env) — não é erro crítico
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 200 })
  }

  return NextResponse.json({ ok: result.ok }, { status: 200 })
}
