import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { gerarDiagnostico } from '@/lib/diagnostico'
import type { RespostasFormulario, DiagnosticoJson } from '@/types/pesquisa'
import type { RespostaInsert } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Campos obrigatórios do formulário — usados na validação básica
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
  'optou_lista',
]

function validar(body: unknown): body is RespostasFormulario {
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

  return true
}

// ---------------------------------------------------------------------------
// Normalização de campos opcionais
// Strings vazias viram null para alinhar com colunas nullable no banco.
// ---------------------------------------------------------------------------

function normalizarOpcional(valor?: string | null): string | undefined {
  if (!valor || valor.trim() === '') return undefined
  return valor.trim()
}

// ---------------------------------------------------------------------------
// POST /api/submit
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
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

  const respostas: RespostasFormulario = body

  // 3. Gerar diagnóstico
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

  // 4. Montar payload — normaliza campos opcionais para null quando vazios
  const payload: RespostaInsert = {
    ...respostas,
    whatsapp:           normalizarOpcional(respostas.whatsapp),
    dificuldade_aberta: normalizarOpcional(respostas.dificuldade_aberta),
    mudaria_aberto:     normalizarOpcional(respostas.mudaria_aberto),
    receio_aberto:      normalizarOpcional(respostas.receio_aberto),
    objecao_aberta:     normalizarOpcional(respostas.objecao_aberta),
    perfil_gerado,
    diagnostico_json,
  }

  // 5. Inserir no Supabase via service role
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

  // 6. Retornar id → cliente redireciona para /diagnostico/[id]
  return NextResponse.json({ id: data.id }, { status: 201 })
}
