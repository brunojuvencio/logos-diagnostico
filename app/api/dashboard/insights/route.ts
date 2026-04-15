import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateDashboardInsights } from '@/lib/dashboard-insights'
import type { DashboardStats } from '@/types/dashboard'
import type { RespostaRow } from '@/lib/supabase'

// Reutiliza a mesma lógica de agregação de /api/dashboard/stats
// para não duplicar queries ao Supabase.
async function fetchStats(): Promise<DashboardStats> {
  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from('respostas')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Supabase: ${error.message}`)

  const rows = (data ?? []) as RespostaRow[]
  const total = rows.length
  const lista  = rows.filter((r) => r.optou_lista).length
  const taxaConversao   = total > 0 ? Math.round((lista / total) * 100) : 0
  const satisfacaoMedia = total > 0
    ? Math.round((rows.reduce((acc, r) => acc + (r.satisfacao ?? 0), 0) / total) * 10) / 10
    : 0

  function contar(campo: keyof RespostaRow): Record<string, number> {
    const acc: Record<string, number> = {}
    for (const row of rows) {
      const val = row[campo] as string | undefined
      if (val) acc[val] = (acc[val] ?? 0) + 1
    }
    return acc
  }

  const porPapel            = contar('papel')
  const porTensao           = contar('tensao')
  const porReacaoConceito   = contar('reacao_conceito')
  const porDisposicaoPagar  = contar('disposicao_pagar')
  const porPerfil           = contar('perfil_gerado')
  const porFeature: Record<string, number> = {}
  for (const row of rows) {
    const val = row.feature_mais_valiosa
    if (val) porFeature[val] = (porFeature[val] ?? 0) + 1
  }

  const porDiaMap = new Map<string, { total: number; lista: number }>()
  for (const row of rows) {
    const data = row.created_at.slice(0, 10)
    const entry = porDiaMap.get(data) ?? { total: 0, lista: 0 }
    entry.total += 1
    if (row.optou_lista) entry.lista += 1
    porDiaMap.set(data, entry)
  }
  const porDia = Array.from(porDiaMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, { total, lista }]) => ({ data, total, lista }))

  const h1Valor    = total > 0 ? Math.round(((porTensao['frequente'] ?? 0) / total) * 100) : 0
  const h3Valor    = total > 0 ? Math.round(((porReacaoConceito['resolve_exato'] ?? 0) / total) * 100) : 0
  const featureRanking = Object.entries(porFeature).sort(([, a], [, b]) => b - a).map(([k]) => k)
  const h4Posicao  = featureRanking.indexOf('palavras_originais') + 1
  const faixaAlvo  = (porDisposicaoPagar['16_30'] ?? 0) + (porDisposicaoPagar['31_50'] ?? 0)
  const h5Valor    = total > 0 ? Math.round((faixaAlvo / total) * 100) : 0

  return {
    total, lista, taxaConversao, satisfacaoMedia,
    porPerfil, porPapel, porDisposicaoPagar, porReacaoConceito, porFeature, porTensao,
    hipoteses: {
      h1: { valor: h1Valor, confirmada: h1Valor >= 40 },
      h3: { valor: h3Valor, confirmada: h3Valor >= 30 },
      h4: { posicao: h4Posicao, confirmada: h4Posicao === 1 },
      h5: { valor: h5Valor, confirmada: h5Valor >= 35 },
    },
    porDia,
    funil: {
      started: 0,
      completed: 0,
      overallCompletionRate: 0,
      biggestDropoffStep: null,
      biggestDropoffLabel: null,
    },
    funilPorEtapa: [],
  }
}

export async function GET() {
  let stats: DashboardStats

  try {
    stats = await fetchStats()
  } catch (err) {
    console.error('[dashboard/insights] Erro ao buscar stats:', err)
    return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 })
  }

  const insights = await generateDashboardInsights(stats)

  return NextResponse.json(insights, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}
