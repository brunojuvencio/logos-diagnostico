/**
 * LOGOS DIAGNÓSTICO — Insights estratégicos do dashboard via OpenAI
 *
 * Server-side only. Não importar em componentes React.
 */

import { openai } from '@/lib/openai'
import type { DashboardStats } from '@/types/dashboard'

// ---------------------------------------------------------------------------
// Contrato público
// ---------------------------------------------------------------------------

export interface DashboardInsights {
  headline: string
  insights: string[]
  recomendacao_estrategica: string
}

// ---------------------------------------------------------------------------
// JSON Schema para saída estruturada
// ---------------------------------------------------------------------------

const INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    insights: {
      type: 'array',
      items: { type: 'string' },
      minItems: 3,
      maxItems: 5,
    },
    recomendacao_estrategica: { type: 'string' },
  },
  required: ['headline', 'insights', 'recomendacao_estrategica'],
  additionalProperties: false,
} as const

// ---------------------------------------------------------------------------
// Labels legíveis para o prompt
// ---------------------------------------------------------------------------

const LABEL_REACAO: Record<string, string> = {
  resolve_exato: 'Resolve exatamente o que preciso',
  parece_util:   'Parece útil, mas tenho dúvidas',
  ja_tenho:      'Já tenho algo que faz isso',
  nao_vejo:      'Não vejo necessidade',
  tenho_receio:  'Tenho receio de usar IA',
}

const LABEL_PAGAR: Record<string, string> = {
  nao_pagaria: 'Não pagaria',
  ate_15:      'Até R$ 15/mês',
  '16_30':     'R$ 16–30/mês',
  '31_50':     'R$ 31–50/mês',
  mais_50:     'Mais de R$ 50/mês',
}

const LABEL_FEATURE: Record<string, string> = {
  palavras_originais: 'Palavras no original',
  contexto_historico: 'Contexto histórico',
  anotacao:           'Anotações integradas',
  esboco_do_estudo:   'Esboço do estudo',
  historico:          'Histórico de sermões',
}

// ---------------------------------------------------------------------------
// Montagem do prompt
// ---------------------------------------------------------------------------

function top3(record: Record<string, number>, labels: Record<string, string>): string {
  return Object.entries(record)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k, v]) => `${labels[k] ?? k} (${v})`)
    .join(', ')
}

function montarPrompt(s: DashboardStats): string {
  const perfilDominante = Object.entries(s.porPerfil)
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Não determinado'

  const tendencia = (() => {
    if (s.porDia.length < 2) return 'dados insuficientes para tendência'
    const metade = Math.floor(s.porDia.length / 2)
    const primeira = s.porDia.slice(0, metade).reduce((a, d) => a + d.total, 0)
    const segunda  = s.porDia.slice(metade).reduce((a, d) => a + d.total, 0)
    if (segunda > primeira * 1.1) return 'crescendo'
    if (segunda < primeira * 0.9) return 'declinando'
    return 'estável'
  })()

  return `
## Dados do diagnóstico Logos (${new Date().toLocaleDateString('pt-BR')})

### Volume
- Total de respondentes: ${s.total}
- Na lista de espera: ${s.lista} (${s.taxaConversao}% de conversão)
- Satisfação média com processo atual: ${s.satisfacaoMedia}/5
- Tendência de volume: ${tendencia}

### Perfil dominante
- ${perfilDominante}

### Reação ao conceito (top 3)
- ${top3(s.porReacaoConceito, LABEL_REACAO)}

### Tensão no preparo
- Com tensão frequente: ${s.porTensao['frequente'] ?? 0} respondentes (${s.total > 0 ? Math.round(((s.porTensao['frequente'] ?? 0) / s.total) * 100) : 0}%)
- Sem tensão: ${s.porTensao['nao'] ?? 0}

### Disposição a pagar (top 3)
- ${top3(s.porDisposicaoPagar, LABEL_PAGAR)}

### Feature mais valiosa (top 3)
- ${top3(s.porFeature, LABEL_FEATURE)}

### Hipóteses
- H1 (tensão frequente ≥ 40%): ${s.hipoteses.h1.confirmada ? 'Confirmada' : 'Não confirmada'} — ${s.hipoteses.h1.valor}%
- H3 (resolve exatamente ≥ 30%): ${s.hipoteses.h3.confirmada ? 'Confirmada' : 'Não confirmada'} — ${s.hipoteses.h3.valor}%
- H4 (palavras originais = #1): ${s.hipoteses.h4.confirmada ? 'Confirmada' : 'Não confirmada'} — posição ${s.hipoteses.h4.posicao}
- H5 (pagar R$16–50 ≥ 35%): ${s.hipoteses.h5.confirmada ? 'Confirmada' : 'Não confirmada'} — ${s.hipoteses.h5.valor}%
`.trim()
}

const SYSTEM_PROMPT = `Você é um analista de produto estratégico especializado em produtos para criadores de conteúdo religioso.

Você recebe dados agregados de um diagnóstico de pregadores e deve gerar insights estratégicos para o time de produto.

Regras obrigatórias:
- Insights curtos, diretos, orientados a decisão
- Foco em "o que isso significa para o produto", não em repetir os números
- Identifique padrões, contradições e oportunidades que os dados revelam
- Se os dados forem insuficientes (total < 10), deixe isso claro na headline
- Linguagem clara, sem jargão de consultoria
- Português do Brasil

Campos que você deve retornar:
- headline: 1 frase resumindo o cenário atual — o que os dados dizem de forma direta
- insights: 3 a 5 bullets curtos — cada um deve revelar algo acionável ou não óbvio
- recomendacao_estrategica: 1 parágrafo com a próxima ação mais importante para produto ou posicionamento`

// ---------------------------------------------------------------------------
// Validação mínima
// ---------------------------------------------------------------------------

function isInsightsValido(obj: unknown): obj is DashboardInsights {
  if (!obj || typeof obj !== 'object') return false
  const d = obj as Record<string, unknown>
  return (
    typeof d.headline                === 'string' && d.headline.trim() !== '' &&
    Array.isArray(d.insights)        && d.insights.length >= 1 &&
    typeof d.recomendacao_estrategica === 'string' && d.recomendacao_estrategica.trim() !== ''
  )
}

// ---------------------------------------------------------------------------
// Fallback local
// ---------------------------------------------------------------------------

function insightsFallback(s: DashboardStats): DashboardInsights {
  if (s.total === 0) {
    return {
      headline: 'Nenhuma resposta coletada ainda.',
      insights: ['Compartilhe o link do diagnóstico para começar a coletar dados.'],
      recomendacao_estrategica: 'Defina um canal de distribuição e uma meta de respondentes para a primeira semana.',
    }
  }

  const tensaoPct = s.total > 0
    ? Math.round(((s.porTensao['frequente'] ?? 0) / s.total) * 100)
    : 0

  return {
    headline: `${s.total} respondentes coletados — taxa de conversão para lista: ${s.taxaConversao}%.`,
    insights: [
      `${tensaoPct}% dos pregadores sentem tensão frequente no preparo — a dor central está confirmada.`,
      `Satisfação média de ${s.satisfacaoMedia}/5 indica que o processo atual deixa espaço para melhoria.`,
      s.taxaConversao >= 50
        ? 'Taxa de conversão acima de 50% — o diagnóstico está gerando interesse real.'
        : 'Taxa de conversão abaixo de 50% — revisar o CTA da última etapa pode ajudar.',
    ],
    recomendacao_estrategica: 'Concentre os próximos esforços em distribuição para atingir volume suficiente (n≥50) antes de tomar decisões de produto com base nos dados.',
  }
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

export async function generateDashboardInsights(
  stats: DashboardStats,
): Promise<DashboardInsights> {
  try {
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: montarPrompt(stats) },
      ],
      text: {
        format: {
          type:   'json_schema',
          name:   'dashboard_insights',
          strict: true,
          schema: INSIGHTS_SCHEMA,
        },
      },
    })

    const parsed: unknown = JSON.parse(response.output_text)

    if (!isInsightsValido(parsed)) {
      throw new Error('Shape inválido retornado pela OpenAI.')
    }

    return parsed
  } catch (err) {
    console.error('[dashboard-insights] Falha na OpenAI — usando fallback:', err)
    return insightsFallback(stats)
  }
}
