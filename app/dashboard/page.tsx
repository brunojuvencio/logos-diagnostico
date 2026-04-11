'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart } from '@/components/dashboard/BarChart'
import type { DashboardStats } from '@/types/dashboard'
import type { DashboardInsights } from '@/lib/dashboard-insights'

// ---------------------------------------------------------------------------
// Labels legíveis para chaves de banco
// ---------------------------------------------------------------------------

const LABEL_PAPEL: Record<string, string> = {
  celula:    'Líder de célula',
  jovens:    'Líder de jovens',
  pastor:    'Pastor / Presbítero',
  estudante: 'Estudante de teologia',
  outro:     'Outra liderança',
}

const LABEL_REACAO: Record<string, string> = {
  resolve_exato: 'Resolve exatamente',
  parece_util:   'Parece útil',
  ja_tenho:      'Já tenho algo',
  nao_vejo:      'Não vejo necessidade',
  tenho_receio:  'Tenho receio de IA',
}

const LABEL_PAGAR: Record<string, string> = {
  nao_pagaria: 'Não pagaria',
  ate_15:      'Até R$ 15',
  '16_30':     'R$ 16–30',
  '31_50':     'R$ 31–50',
  mais_50:     'Mais de R$ 50',
}

const LABEL_TENSAO: Record<string, string> = {
  frequente:   'Com frequência',
  raramente:   'Raramente',
  nao:         'Não',
  prefiro_nao: 'Prefere não responder',
}

const LABEL_FEATURE: Record<string, string> = {
  palavras_originais: 'Palavras originais',
  contexto_historico: 'Contexto histórico',
  anotacao:           'Anotações integradas',
  esboco_do_estudo:   'Esboço do estudo',
  historico:          'Histórico de sermões',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBarData(record: Record<string, number>, labels: Record<string, string>) {
  return Object.entries(record).map(([key, value]) => ({
    label: labels[key] ?? key,
    value,
  }))
}

// ---------------------------------------------------------------------------
// Componentes internos
// ---------------------------------------------------------------------------

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--logos-space-10)' }}>
      <h2 style={{
        fontFamily: 'var(--logos-font-body)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--logos-tinta-light)',
        marginBottom: 'var(--logos-space-5)',
      }}>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'var(--logos-papel)',
      border: 'var(--logos-border-width-thin) solid var(--logos-border)',
      borderRadius: 'var(--logos-radius-md)',
      padding: 'var(--logos-space-6)',
      boxShadow: '0 1px 4px rgba(14,14,12,0.04)',
    }}>
      {children}
    </div>
  )
}

function HipoteseRow({
  label,
  valor,
  confirmada,
  tipo = 'valor',
}: {
  label: string
  valor: number
  confirmada: boolean
  tipo?: 'valor' | 'posicao'
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--logos-space-4) 0',
      borderBottom: 'var(--logos-border-width-thin) solid var(--logos-border)',
    }}>
      <span style={{ fontFamily: 'var(--logos-font-body)', fontSize: '13px', color: 'var(--logos-tinta-mid)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--logos-space-4)' }}>
        <span style={{
          fontFamily: 'var(--logos-font-display)',
          fontSize: '22px',
          fontWeight: 300,
          color: 'var(--logos-tinta)',
        }}>
          {tipo === 'posicao' ? `#${valor}` : `${valor}%`}
        </span>
        <span style={{
          fontFamily: 'var(--logos-font-body)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          borderRadius: 'var(--logos-radius-full)',
          backgroundColor: confirmada ? 'var(--logos-sucesso-fundo)' : 'var(--logos-erro-fundo)',
          color: confirmada ? 'var(--logos-sucesso)' : 'var(--logos-erro)',
        }}>
          {confirmada ? 'Confirmada' : 'Não confirmada'}
        </span>
      </div>
    </div>
  )
}

// Sparkline de barras verticais para série por dia
function Sparkline({ data }: { data: DashboardStats['porDia'] }) {
  if (data.length === 0) return (
    <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '13px', color: 'var(--logos-tinta-light)' }}>
      Sem dados ainda.
    </p>
  )

  const max = Math.max(...data.map((d) => d.total), 1)

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        height: '64px',
        marginBottom: 'var(--logos-space-3)',
      }}>
        {data.map(({ data: dia, total, lista }) => (
          <div
            key={dia}
            title={`${dia}: ${total} respondentes, ${lista} na lista`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
            }}
          >
            {/* Barra total */}
            <div style={{
              width: '100%',
              height: `${Math.round((total / max) * 100)}%`,
              minHeight: '2px',
              borderRadius: '2px 2px 0 0',
              backgroundColor: 'var(--logos-dourado)',
              opacity: 0.9,
              position: 'relative',
            }}>
              {/* Camada lista */}
              {lista > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${Math.round((lista / total) * 100)}%`,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: 'var(--logos-dourado-claro)',
                }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Eixo X — apenas primeiro e último */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[data[0], data[data.length - 1]].map((d) => d && (
          <span key={d.data} style={{
            fontFamily: 'var(--logos-font-body)',
            fontSize: '10px',
            color: 'var(--logos-tinta-light)',
          }}>
            {d.data.slice(5)} {/* MM-DD */}
          </span>
        ))}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 'var(--logos-space-5)', marginTop: 'var(--logos-space-4)' }}>
        {[
          { color: 'var(--logos-dourado)', label: 'Total' },
          { color: 'var(--logos-dourado-claro)', label: 'Lista de espera' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--logos-space-2)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color }} />
            <span style={{ fontFamily: 'var(--logos-font-body)', fontSize: '11px', color: 'var(--logos-tinta-light)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [stats, setStats]         = useState<DashboardStats | null>(null)
  const [insights, setInsights]   = useState<DashboardInsights | null>(null)
  const [loading, setLoading]     = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)
  const [erro, setErro]           = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<DashboardStats>
      })
      .then(setStats)
      .catch(() => setErro('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [])

  function gerarInsights() {
    if (loadingAI || insights) return
    setLoadingAI(true)
    fetch('/api/dashboard/insights')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<DashboardInsights>
      })
      .then(setInsights)
      .catch(() => setErro('Não foi possível gerar os insights.'))
      .finally(() => setLoadingAI(false))
  }

  return (
    <main style={{
      minHeight: '100svh',
      backgroundColor: 'var(--logos-pergaminho)',
      padding: 'var(--logos-space-8) var(--logos-space-5)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: 'var(--logos-space-10)' }}>
          <p style={{
            fontFamily: 'var(--logos-font-body)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--logos-tinta-light)',
            marginBottom: 'var(--logos-space-2)',
          }}>
            Logos Diagnóstico
          </p>
          <h1 style={{
            fontFamily: 'var(--logos-font-display)',
            fontSize: '32px',
            fontWeight: 300,
            color: 'var(--logos-tinta)',
            margin: 0,
          }}>
            Visão geral
          </h1>
        </header>

        {/* Loading */}
        {loading && (
          <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '14px', color: 'var(--logos-tinta-light)' }}>
            Carregando dados…
          </p>
        )}

        {/* Erro */}
        {erro && (
          <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '14px', color: 'var(--logos-erro)' }}>
            {erro}
          </p>
        )}

        {/* Conteúdo */}
        {stats && (
          <>
            {/* Cards de topo */}
            <Section titulo="Métricas principais">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--logos-space-4)',
                marginBottom: 'var(--logos-space-2)',
              }}>
                <StatCard
                  label="Respondentes"
                  value={stats.total}
                  sub="total até agora"
                />
                <StatCard
                  label="Lista de espera"
                  value={stats.lista}
                  sub={`${stats.taxaConversao}% dos respondentes`}
                  trend="up"
                />
                <StatCard
                  label="Taxa de conversão"
                  value={`${stats.taxaConversao}%`}
                  trend={stats.taxaConversao >= 50 ? 'up' : 'neutral'}
                />
                <StatCard
                  label="Satisfação média"
                  value={`${stats.satisfacaoMedia}/5`}
                  sub="processo atual do pregador"
                  trend={stats.satisfacaoMedia <= 3 ? 'down' : 'neutral'}
                />
              </div>
            </Section>

            {/* Série por dia */}
            <Section titulo="Respondentes por dia">
              <Card>
                <Sparkline data={stats.porDia} />
              </Card>
            </Section>

            {/* Grid de distribuições */}
            <Section titulo="Distribuições">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: 'var(--logos-space-4)',
              }}>
                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    Reação ao conceito
                  </p>
                  <BarChart
                    data={toBarData(stats.porReacaoConceito, LABEL_REACAO)}
                    total={stats.total}
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    Disposição a pagar
                  </p>
                  <BarChart
                    data={toBarData(stats.porDisposicaoPagar, LABEL_PAGAR)}
                    total={stats.total}
                    color="var(--logos-sucesso)"
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    Papel / função
                  </p>
                  <BarChart
                    data={toBarData(stats.porPapel, LABEL_PAPEL)}
                    total={stats.total}
                    color="var(--logos-tinta-light)"
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    Tensão no preparo
                  </p>
                  <BarChart
                    data={toBarData(stats.porTensao, LABEL_TENSAO)}
                    total={stats.total}
                    color="var(--logos-aviso)"
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    Feature mais valiosa
                  </p>
                  <BarChart
                    data={toBarData(stats.porFeature, LABEL_FEATURE)}
                    total={stats.total}
                    color="var(--logos-info)"
                  />
                </Card>

                {Object.keys(stats.porPerfil).length > 0 && (
                  <Card>
                    <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                      Perfis gerados
                    </p>
                    <BarChart
                      data={toBarData(stats.porPerfil, {})}
                      total={stats.total}
                      color="var(--logos-dourado)"
                    />
                  </Card>
                )}
              </div>
            </Section>

            {/* Hipóteses */}
            <Section titulo="Hipóteses">
              <Card>
                <HipoteseRow
                  label="H1 — Tensão frequente no preparo (meta ≥ 40%)"
                  valor={stats.hipoteses.h1.valor}
                  confirmada={stats.hipoteses.h1.confirmada}
                />
                <HipoteseRow
                  label="H3 — Reação 'resolve exatamente' (meta ≥ 30%)"
                  valor={stats.hipoteses.h3.valor}
                  confirmada={stats.hipoteses.h3.confirmada}
                />
                <HipoteseRow
                  label="H4 — 'Palavras originais' como feature #1 (meta: posição 1)"
                  valor={stats.hipoteses.h4.posicao}
                  confirmada={stats.hipoteses.h4.confirmada}
                  tipo="posicao"
                />
                <HipoteseRow
                  label="H5 — Disposição a pagar R$ 16–50/mês (meta ≥ 35%)"
                  valor={stats.hipoteses.h5.valor}
                  confirmada={stats.hipoteses.h5.confirmada}
                />
              </Card>
            </Section>

            {/* Análise IA — acionada por botão */}
            <Section titulo="Análise IA">
              {!insights && !loadingAI && (
                <button
                  onClick={gerarInsights}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--logos-space-3)',
                    width: '100%',
                    padding: 'var(--logos-space-6)',
                    backgroundColor: 'var(--logos-papel)',
                    border: 'var(--logos-border-width-default) solid var(--logos-border)',
                    borderRadius: 'var(--logos-radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color var(--logos-duration-default) var(--logos-ease-default)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--logos-border-emphasis)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--logos-border)' }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--logos-radius-sm)',
                    backgroundColor: 'var(--logos-dourado-faint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '16px',
                  }}>
                    ✦
                  </span>
                  <div>
                    <p style={{
                      fontFamily: 'var(--logos-font-body)',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--logos-tinta)',
                      margin: '0 0 2px',
                    }}>
                      Gerar análise com IA
                    </p>
                    <p style={{
                      fontFamily: 'var(--logos-font-body)',
                      fontSize: '12px',
                      color: 'var(--logos-tinta-light)',
                      margin: 0,
                    }}>
                      Insights estratégicos e recomendação com base nos dados atuais
                    </p>
                  </div>
                </button>
              )}

              {loadingAI && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--logos-space-3)',
                  padding: 'var(--logos-space-6)',
                  backgroundColor: 'var(--logos-papel)',
                  border: 'var(--logos-border-width-thin) solid var(--logos-border)',
                  borderRadius: 'var(--logos-radius-md)',
                }}>
                  <div style={{
                    width: '14px', height: '14px',
                    borderRadius: '9999px',
                    border: '2px solid var(--logos-dourado)',
                    borderTopColor: 'transparent',
                    animation: 'spin 600ms linear infinite',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: 'var(--logos-font-body)', fontSize: '13px', color: 'var(--logos-tinta-light)' }}>
                    Analisando dados…
                  </span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              )}

              {insights && (
                <div style={{
                  backgroundColor: 'var(--logos-vespera)',
                  borderRadius: 'var(--logos-radius-md)',
                  padding: 'var(--logos-space-8)',
                }}>
                  <p style={{
                    fontFamily: 'var(--logos-font-body)',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--logos-dourado)',
                    marginBottom: 'var(--logos-space-4)',
                  }}>
                    Análise IA
                  </p>
                  <h2 style={{
                    fontFamily: 'var(--logos-font-display)',
                    fontSize: '22px',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: 'var(--logos-tinta-invertida)',
                    lineHeight: '1.4',
                    marginBottom: 'var(--logos-space-6)',
                  }}>
                    {insights.headline}
                  </h2>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--logos-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-3)' }}>
                    {insights.insights.map((item, i) => (
                      <li key={i} style={{ display: 'flex', gap: 'var(--logos-space-3)', alignItems: 'flex-start' }}>
                        <span style={{
                          flexShrink: 0,
                          width: '6px',
                          height: '6px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--logos-dourado)',
                          marginTop: '6px',
                        }} />
                        <span style={{
                          fontFamily: 'var(--logos-font-body)',
                          fontSize: '13px',
                          lineHeight: '1.65',
                          color: 'var(--logos-tinta-invertida)',
                          opacity: 0.85,
                        }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div style={{
                    borderTop: '1px solid rgba(184, 149, 42, 0.25)',
                    paddingTop: 'var(--logos-space-5)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--logos-font-body)',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--logos-dourado)',
                      marginBottom: 'var(--logos-space-3)',
                    }}>
                      Recomendação estratégica
                    </p>
                    <p style={{
                      fontFamily: 'var(--logos-font-body)',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: 'var(--logos-tinta-invertida)',
                      opacity: 0.9,
                      margin: 0,
                    }}>
                      {insights.recomendacao_estrategica}
                    </p>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </main>
  )
}
