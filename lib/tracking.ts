/**
 * LOGOS DIAGNÓSTICO — Camada de tracking client-side unificada
 *
 * trackEvent() dispara simultaneamente para Meta CAPI e GA4 via as API Routes
 * /api/tracking/meta e /api/tracking/ga4.
 *
 * - Enriquece automaticamente com UTMs, page_url, referrer, user_agent
 * - Retry automático (2 tentativas por plataforma)
 * - Fire and forget — NUNCA bloqueia o fluxo do usuário
 * - Logs estruturados em desenvolvimento
 *
 * Uso exclusivo em client components / useEffect.
 */

import { getTrackingSnapshot, getGA4ClientId } from '@/lib/utm'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface TrackEventOptions {
  /** email do usuário (será hasheado no servidor) */
  email?: string
  /** telefone/whatsapp (será hasheado no servidor) */
  phone?: string
  /** primeiro nome (será hasheado no servidor) */
  firstName?: string
  /** ID único pré-gerado para deduplicação pixel ↔ CAPI */
  eventId?: string
  /** parâmetros customizados para GA4 */
  params?: Record<string, unknown>
  /** valor monetário (para eventos de conversão) */
  value?: number
  currency?: string
  /** identificador do formulário (para generate_lead) */
  formName?: string
}

// Mapeamento Meta → GA4
const EVENT_MAP: Record<string, string> = {
  PageView:              'page_view',
  ViewContent:           'view_item',
  Lead:                  'generate_lead',
  Contact:               'contact',
  CompleteRegistration:  'sign_up',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

async function fireWithRetry(
  url: string,
  body: object,
  retries = 2
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        // keepalive para garantir que o request não seja cancelado no unload
        keepalive: true,
      })
      if (res.ok) return
      if (attempt === retries) {
        console.warn(`[tracking] ${url} respondeu ${res.status}`)
      }
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[tracking] Falha ao enviar para ${url}:`, err)
      }
      // aguarda 300ms antes de tentar novamente
      if (attempt < retries) await new Promise((r) => setTimeout(r, 300))
    }
  }
}

// ---------------------------------------------------------------------------
// trackEvent — função principal
// ---------------------------------------------------------------------------

/**
 * Dispara um evento de tracking para Meta CAPI e GA4 simultaneamente.
 *
 * @param metaEventName - Nome do evento no padrão Meta (ex: "Lead", "PageView")
 * @param options       - Dados do evento (PII, params, etc.)
 *
 * @example
 * await trackEvent('Lead', { email, phone, firstName: nome, formName: 'diagnostico' })
 * trackEvent('PageView')  // fire and forget, sem await
 */
export function trackEvent(
  metaEventName: string,
  options: TrackEventOptions = {}
): void {
  if (typeof window === 'undefined') return

  const snapshot     = getTrackingSnapshot()
  const ga4EventName = EVENT_MAP[metaEventName] ?? metaEventName.toLowerCase()
  const eventId      = options.eventId ?? generateEventId()
  const ga4ClientId  = getGA4ClientId()

  // Payload Meta
  const metaBody = {
    eventName:      metaEventName,
    eventId,
    eventSourceUrl: snapshot.page_url,
    email:          options.email,
    phone:          options.phone,
    firstName:      options.firstName,
    fbp:            snapshot.fbp,
    fbc:            snapshot.fbc,
    customData: {
      ...(options.value    ? { value: options.value }       : {}),
      ...(options.currency ? { currency: options.currency } : {}),
    },
  }

  // Payload GA4
  const ga4Body = {
    eventName:  ga4EventName,
    clientId:   ga4ClientId,
    params: {
      page_location:  snapshot.page_url,
      page_referrer:  snapshot.referrer,
      utm_source:     snapshot.utm_source,
      utm_medium:     snapshot.utm_medium,
      utm_campaign:   snapshot.utm_campaign,
      utm_term:       snapshot.utm_term,
      utm_content:    snapshot.utm_content,
      ...(options.formName ? { form_name: options.formName } : {}),
      ...(options.value    ? { value: options.value }        : {}),
      ...(options.currency ? { currency: options.currency }  : {}),
      ...options.params,
    },
  }

  // Fire and forget — não bloqueia o fluxo
  Promise.allSettled([
    fireWithRetry('/api/tracking/meta', metaBody),
    fireWithRetry('/api/tracking/ga4',  ga4Body),
  ]).catch(() => {
    // silencia rejeições não tratadas
  })
}
