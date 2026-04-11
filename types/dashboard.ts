/**
 * LOGOS DIAGNÓSTICO — Tipos do Dashboard
 * Fonte de verdade: spec v1.0
 * NÃO adicionar campos fora da spec sem alinhamento.
 */

import type {
  Papel,
  DisposicaoPagar,
  ReacaoConceito,
  FeatureValiosa,
  Tensao,
} from './pesquisa'

// ---------------------------------------------------------------------------
// RE-EXPORTS — aliases para uso isolado no contexto do dashboard
// ---------------------------------------------------------------------------

export type { Papel, DisposicaoPagar, ReacaoConceito, FeatureValiosa, Tensao }

/**
 * Perfil gerado pelo diagnóstico — chave de agrupamento no dashboard.
 * @todo Substituir por union type concreto após lib/diagnostico.ts ser fornecido.
 */
export type Perfil = string

// ---------------------------------------------------------------------------
// TIPOS AUXILIARES DE HIPÓTESE
// ---------------------------------------------------------------------------

/** Hipótese medida por percentual (0–100). */
export interface HipoteseValor {
  valor: number
  confirmada: boolean
}

/** Hipótese medida por posição ordinal em um ranking. */
export interface HipotesePosicao {
  posicao: number
  confirmada: boolean
}

// ---------------------------------------------------------------------------
// HIPÓTESES
// ---------------------------------------------------------------------------

export interface HipotesesDashboard {
  /** H1 — % de respondentes que marcou "frequente" em tensão (P1.5) */
  h1: HipoteseValor
  /** H3 — % que escolheu "resolve_exato" em reação ao conceito (P2.1) */
  h3: HipoteseValor
  /** H4 — posição de "palavras_originais" entre as features mais valiosas (P2.2) */
  h4: HipotesePosicao
  /** H5 — % que marcou "16_30" ou "31_50" em disposição a pagar (P2.3) */
  h5: HipoteseValor
}

// ---------------------------------------------------------------------------
// SÉRIE TEMPORAL
// ---------------------------------------------------------------------------

export interface SerieRespondentesPorDia {
  data: string
  total: number
  lista: number
}

// ---------------------------------------------------------------------------
// STATS AGREGADAS
// ---------------------------------------------------------------------------

export interface DashboardStats {
  total: number
  lista: number
  taxaConversao: number
  satisfacaoMedia: number

  porPerfil: Record<Perfil, number>
  porPapel: Record<Papel, number>
  porDisposicaoPagar: Record<DisposicaoPagar, number>
  porReacaoConceito: Record<ReacaoConceito, number>
  porFeature: Record<FeatureValiosa, number>
  porTensao: Record<Tensao, number>

  hipoteses: HipotesesDashboard

  porDia: SerieRespondentesPorDia[]
}
