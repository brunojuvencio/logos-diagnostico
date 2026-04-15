/**
 * LOGOS DIAGNÓSTICO — Meta Conversions API (CAPI)
 *
 * Funções server-only para enviar eventos ao Meta via server-side.
 * NUNCA importar em código client-side.
 *
 * Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface MetaUserData {
  email?: string
  phone?: string
  firstName?: string
  clientIp?: string
  clientUserAgent?: string
  fbp?: string | null
  fbc?: string | null
}

export interface MetaEventPayload {
  eventName: string
  eventId: string
  eventTime?: number
  eventSourceUrl?: string
  userData?: MetaUserData
  customData?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function hashPhone(raw: string): string {
  // Remove tudo que não é dígito e aplica SHA-256
  const digits = raw.replace(/\D/g, '')
  return createHash('sha256').update(digits).digest('hex')
}

function buildUserData(u: MetaUserData): Record<string, unknown> {
  const ud: Record<string, unknown> = {}

  if (u.email)           ud.em  = [sha256(u.email)]
  if (u.phone)           ud.ph  = [hashPhone(u.phone)]
  if (u.firstName)       ud.fn  = [sha256(u.firstName)]
  if (u.clientIp)        ud.client_ip_address  = u.clientIp
  if (u.clientUserAgent) ud.client_user_agent  = u.clientUserAgent
  if (u.fbp)             ud.fbp = u.fbp
  if (u.fbc)             ud.fbc = u.fbc

  return ud
}

// ---------------------------------------------------------------------------
// Envio
// ---------------------------------------------------------------------------

export interface MetaSendResult {
  ok: boolean
  status?: number
  body?: unknown
  error?: string
}

export async function sendMetaEvent(payload: MetaEventPayload): Promise<MetaSendResult> {
  const pixelId     = process.env.META_PIXEL_ID
  const accessToken = process.env.META_ACCESS_TOKEN
  const testCode    = process.env.META_TEST_EVENT_CODE

  if (!pixelId || !accessToken) {
    console.warn('[meta-capi] META_PIXEL_ID ou META_ACCESS_TOKEN não configurados — evento ignorado.')
    return { ok: false, error: 'not_configured' }
  }

  const now = Math.floor(Date.now() / 1000)

  const event: Record<string, unknown> = {
    event_name:        payload.eventName,
    event_time:        payload.eventTime ?? now,
    event_id:          payload.eventId,
    action_source:     'website',
  }

  if (payload.eventSourceUrl) event.event_source_url = payload.eventSourceUrl
  if (payload.userData)       event.user_data        = buildUserData(payload.userData)
  if (payload.customData)     event.custom_data      = payload.customData

  const body: Record<string, unknown> = {
    data: [event],
  }

  // Inclui test_event_code apenas se definido (para validar no Events Manager)
  if (testCode) body.test_event_code = testCode

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const responseBody = await res.json().catch(() => null)

    if (!res.ok) {
      console.error(`[meta-capi] Erro ${res.status}:`, responseBody)
      return { ok: false, status: res.status, body: responseBody }
    }

    console.log(`[meta-capi] ${payload.eventName} enviado (event_id=${payload.eventId})`)
    return { ok: true, status: res.status, body: responseBody }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[meta-capi] Falha na requisição:', message)
    return { ok: false, error: message }
  }
}
