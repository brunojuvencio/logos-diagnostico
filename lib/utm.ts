/**
 * LOGOS DIAGNÓSTICO — UTM Tracking Utilities
 *
 * Captura parâmetros de UTM da URL, persiste em cookie first-party por 90 dias
 * e fornece getTrackingSnapshot() para incluir em qualquer evento ou submit.
 *
 * Uso exclusivo no browser — todas as funções retornam vazio em SSR.
 */

import type { TrackingPayload } from '@/types/pesquisa'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const UTM_COOKIE       = '_logos_utm'
const GA_CLIENT_COOKIE = '_logos_cid'
const COOKIE_DAYS      = 90

// ---------------------------------------------------------------------------
// Cookie helpers — sem dependências externas
// ---------------------------------------------------------------------------

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

// ---------------------------------------------------------------------------
// UTM Capture — lê da URL e persiste em cookie
// ---------------------------------------------------------------------------

const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid',
] as const

type UTMKey = (typeof UTM_KEYS)[number]

/**
 * Captura UTMs da URL atual e os persiste em cookie por 90 dias.
 * Se a URL não tiver UTMs, mantém os valores já armazenados (sem sobrescrever).
 * Deve ser chamada no `useEffect` do TrackingProvider.
 */
export function captureUTMs(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const fromUrl: Partial<Record<UTMKey, string>> = {}

  for (const key of UTM_KEYS) {
    const val = params.get(key)
    if (val) fromUrl[key] = val
  }

  // Só atualiza o cookie se a URL trouxer pelo menos um parâmetro
  if (Object.keys(fromUrl).length === 0) return

  const existing = getStoredUTMs()
  const merged   = { ...existing, ...fromUrl }
  setCookie(UTM_COOKIE, JSON.stringify(merged), COOKIE_DAYS)
}

/**
 * Retorna os UTMs atualmente armazenados no cookie.
 */
export function getStoredUTMs(): Partial<Record<UTMKey, string>> {
  try {
    const raw = getCookie(UTM_COOKIE)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<Record<UTMKey, string>>
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Meta Pixel cookies — fbp e fbc
// ---------------------------------------------------------------------------

function getMetaCookies(): Pick<TrackingPayload, 'fbp' | 'fbc'> {
  return {
    fbp: getCookie('_fbp') ?? undefined,
    fbc: getCookie('_fbc') ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// GA4 Client ID
// ---------------------------------------------------------------------------

/**
 * Retorna o client_id para uso no GA4 Measurement Protocol.
 * Prioridade: cookie _ga (Google Analytics nativo) → cookie _logos_cid → gera novo.
 *
 * Formato esperado pelo GA4: "XXXXXXXXXX.XXXXXXXXXX" (sem prefixo "GA1.X.").
 */
export function getGA4ClientId(): string {
  if (typeof window === 'undefined') return 'ssr'

  // Tenta extrair do cookie _ga do Google Analytics
  const gaCookie = getCookie('_ga')
  if (gaCookie) {
    // Formato: GA1.1.1234567890.1234567890 → extrai a parte após "GA1.X."
    const parts = gaCookie.split('.')
    if (parts.length >= 4) {
      return `${parts[2]}.${parts[3]}`
    }
  }

  // Verifica se já temos um client_id gerado anteriormente
  const stored = getCookie(GA_CLIENT_COOKIE)
  if (stored) return stored

  // Gera novo client_id e persiste por 2 anos
  const generated = `${Math.floor(Math.random() * 1_000_000_000 + 1_000_000_000)}.${Math.floor(Date.now() / 1000)}`
  setCookie(GA_CLIENT_COOKIE, generated, 730)
  return generated
}

// ---------------------------------------------------------------------------
// Snapshot completo — usado no submit e em eventos de tracking
// ---------------------------------------------------------------------------

/**
 * Retorna todos os dados de tracking disponíveis no browser:
 * UTMs armazenados, fbp/fbc do Meta Pixel, GA4 client_id,
 * page_url, referrer e user_agent.
 */
export function getTrackingSnapshot(): TrackingPayload {
  if (typeof window === 'undefined') return {}

  const utms    = getStoredUTMs()
  const meta    = getMetaCookies()

  return {
    utm_source:   utms.utm_source,
    utm_medium:   utms.utm_medium,
    utm_campaign: utms.utm_campaign,
    utm_term:     utms.utm_term,
    utm_content:  utms.utm_content,
    gclid:        utms.gclid,
    fbclid:       utms.fbclid,
    fbp:          meta.fbp,
    fbc:          meta.fbc,
    page_url:     window.location.href,
    referrer:     document.referrer || undefined,
    user_agent:   navigator.userAgent,
    ga_client_id: getGA4ClientId(),
  }
}
