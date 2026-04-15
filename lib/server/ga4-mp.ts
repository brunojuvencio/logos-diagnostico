/**
 * LOGOS DIAGNÓSTICO — GA4 Measurement Protocol
 *
 * Funções server-only para enviar eventos ao GA4 via server-side.
 * NUNCA importar em código client-side.
 *
 * Documentação: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface GA4EventParams {
  form_name?: string
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  value?: number
  currency?: string
  page_location?: string
  page_referrer?: string
  [key: string]: unknown
}

export interface GA4EventPayload {
  clientId: string
  eventName: string
  params?: GA4EventParams
  sessionId?: string
  debug?: boolean  // usa endpoint /debug/mp/collect
}

// ---------------------------------------------------------------------------
// Envio
// ---------------------------------------------------------------------------

export interface GA4SendResult {
  ok: boolean
  status?: number
  body?: unknown
  error?: string
}

export async function sendGA4Event(payload: GA4EventPayload): Promise<GA4SendResult> {
  const measurementId = process.env.GA4_MEASUREMENT_ID
  const apiSecret     = process.env.GA4_API_SECRET

  if (!measurementId || !apiSecret) {
    console.warn('[ga4-mp] GA4_MEASUREMENT_ID ou GA4_API_SECRET não configurados — evento ignorado.')
    return { ok: false, error: 'not_configured' }
  }

  const baseUrl = payload.debug
    ? 'https://www.google-analytics.com/debug/mp/collect'
    : 'https://www.google-analytics.com/mp/collect'

  const url = `${baseUrl}?measurement_id=${measurementId}&api_secret=${apiSecret}`

  const params: GA4EventParams = {
    engagement_time_msec: 100,
    ...payload.params,
  }

  if (payload.sessionId) params.session_id = payload.sessionId

  const body = {
    client_id: payload.clientId,
    events: [
      {
        name: payload.eventName,
        params,
      },
    ],
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // GA4 MP retorna 204 No Content em produção (sem body)
    // /debug retorna 200 com validação
    if (payload.debug) {
      const responseBody = await res.json().catch(() => null)
      if (!res.ok) {
        console.error(`[ga4-mp] Erro ${res.status}:`, responseBody)
        return { ok: false, status: res.status, body: responseBody }
      }
      console.log(`[ga4-mp] DEBUG ${payload.eventName}:`, responseBody)
      return { ok: true, status: res.status, body: responseBody }
    }

    if (res.status !== 204 && res.status !== 200) {
      console.error(`[ga4-mp] Status inesperado: ${res.status}`)
      return { ok: false, status: res.status }
    }

    console.log(`[ga4-mp] ${payload.eventName} enviado (client_id=${payload.clientId})`)
    return { ok: true, status: res.status }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ga4-mp] Falha na requisição:', message)
    return { ok: false, error: message }
  }
}
