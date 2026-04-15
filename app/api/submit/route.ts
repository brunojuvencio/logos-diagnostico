import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { gerarDiagnostico } from '@/lib/diagnostico'
import { sendMetaEvent } from '@/lib/server/meta-capi'
import { sendGA4Event }  from '@/lib/server/ga4-mp'
import type { RespostasFormulario, DiagnosticoJson, TrackingPayload } from '@/types/pesquisa'
import type { RespostaInsert } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface SubmitBody extends RespostasFormulario {
  tracking?: TrackingPayload
}

// ---------------------------------------------------------------------------
// Campos obrigatórios do formulário
// ---------------------------------------------------------------------------

const CAMPOS_OBRIGATORIOS: (keyof RespostasFormulario)[] = [
  'frequencia',
  'papel',
  'rotina',
  'ferramentas',
  'satisfacao',
  'tensao',
  'reacao_conceito',
  'feature_mais_valiosa',
  'disposicao_pagar',
  'estilo',
  'desejo_melhoria',
  'tamanho_congregacao',
  'nome',
  'email',
  'whatsapp',
  'optou_lista',
]

// ---------------------------------------------------------------------------
// Validações
// ---------------------------------------------------------------------------

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

function validar(body: unknown): body is SubmitBody {
  if (!body || typeof body !== 'object') return false

  const b = body as Record<string, unknown>

  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (b[campo] === undefined || b[campo] === null) return false
  }

  if (typeof b.satisfacao !== 'number' || b.satisfacao < 1 || b.satisfacao > 5) return false
  if (!Array.isArray(b.ferramentas)) return false
  if (!b.ferramentas.every((item) => typeof item === 'string')) return false
  if (typeof b.optou_lista !== 'boolean') return false
  if (typeof b.nome !== 'string' || b.nome.trim() === '') return false
  if (typeof b.email !== 'string' || !isValidEmail(b.email)) return false
  if (typeof b.whatsapp !== 'string' || !isValidPhone(b.whatsapp)) return false

  return true
}

// ---------------------------------------------------------------------------
// Normalização de campos opcionais
// ---------------------------------------------------------------------------

function normalizarOpcional(valor?: string | null): string | undefined {
  if (!valor || valor.trim() === '') return undefined
  return valor.trim()
}

// ---------------------------------------------------------------------------
// Extração de IP do request
// ---------------------------------------------------------------------------

function getClientIp(req: NextRequest): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  )
}

// ---------------------------------------------------------------------------
// POST /api/submit
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Parsear body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body inválido.' },
      { status: 400 },
    )
  }

  console.log('[submit] body recebido:', body)

  // 2. Validar campos obrigatórios
  if (!validar(body)) {
    console.log('[submit] body inválido:', body)
    return NextResponse.json(
      { error: 'Campos obrigatórios ausentes ou inválidos.' },
      { status: 422 },
    )
  }

  const { tracking, ...respostas } = body as SubmitBody & { tracking?: TrackingPayload }

  // 3. Capturar dados server-side
  const clientIp        = getClientIp(request)
  const serverUserAgent = request.headers.get('user-agent') ?? undefined

  // 4. Gerar diagnóstico
  let perfil_gerado: string
  let diagnostico_json: DiagnosticoJson

  try {
    const resultado = await gerarDiagnostico(respostas)
    perfil_gerado = resultado.perfil_gerado
    diagnostico_json = resultado.diagnostico_json
  } catch (err) {
    console.error('[submit] Erro ao gerar diagnóstico:', err)
    return NextResponse.json(
      { error: 'Erro ao processar diagnóstico.' },
      { status: 500 },
    )
  }

  // 5. Montar payload para Supabase
  const payload: RespostaInsert = {
    ...respostas,
    dificuldade_aberta: normalizarOpcional(respostas.dificuldade_aberta),
    mudaria_aberto:     normalizarOpcional(respostas.mudaria_aberto),
    receio_aberto:      normalizarOpcional(respostas.receio_aberto),
    objecao_aberta:     normalizarOpcional(respostas.objecao_aberta),
    perfil_gerado,
    diagnostico_json,
    // Campos de tracking
    utm_source:   normalizarOpcional(tracking?.utm_source),
    utm_medium:   normalizarOpcional(tracking?.utm_medium),
    utm_campaign: normalizarOpcional(tracking?.utm_campaign),
    utm_term:     normalizarOpcional(tracking?.utm_term),
    utm_content:  normalizarOpcional(tracking?.utm_content),
    gclid:        normalizarOpcional(tracking?.gclid),
    fbclid:       normalizarOpcional(tracking?.fbclid),
    fbp:          normalizarOpcional(tracking?.fbp),
    fbc:          normalizarOpcional(tracking?.fbc),
    page_url:     normalizarOpcional(tracking?.page_url),
    referrer:     normalizarOpcional(tracking?.referrer),
    user_agent:   normalizarOpcional(tracking?.user_agent ?? serverUserAgent),
    ip_address:   clientIp,
  }

  // 6. Inserir no Supabase via service role
  const { data, error } = await getSupabaseAdmin()
    .from('respostas')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data) {
    console.error('[submit] Supabase insert error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar resposta.' },
      { status: 500 },
    )
  }

  const leadId   = data.id
  const eventId  = tracking?.event_id ?? `lead-${leadId}`
  const gaClient = tracking?.ga_client_id ?? 'unknown'

  // 7. Server-side tracking — fire and forget (não bloqueia a resposta)
  const firstName = respostas.nome.trim().split(' ')[0]

  Promise.allSettled([
    // Meta CAPI — Lead
    sendMetaEvent({
      eventName:      'Lead',
      eventId,
      eventSourceUrl: tracking?.page_url,
      userData: {
        email:          respostas.email,
        phone:          respostas.whatsapp,
        firstName,
        clientIp,
        clientUserAgent: serverUserAgent,
        fbp:  tracking?.fbp,
        fbc:  tracking?.fbc,
      },
    }),

    // GA4 — generate_lead
    sendGA4Event({
      eventName: 'generate_lead',
      clientId:  gaClient,
      params: {
        form_name:    'diagnostico',
        page_location: tracking?.page_url,
        page_referrer: tracking?.referrer,
        utm_source:    tracking?.utm_source,
        utm_medium:    tracking?.utm_medium,
        utm_campaign:  tracking?.utm_campaign,
        utm_term:      tracking?.utm_term,
        utm_content:   tracking?.utm_content,
      },
    }),
  ]).catch(() => {})

  // 8. Retornar id → cliente redireciona para /diagnostico/[id]
  return NextResponse.json({ id: leadId }, { status: 201 })
}
