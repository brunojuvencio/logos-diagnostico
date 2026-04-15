'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart } from '@/components/dashboard/BarChart'
import type { DashboardStats } from '@/types/dashboard'
import type { DashboardInsights } from '@/lib/dashboard-insights'

// ---------------------------------------------------------------------------
// Labels legÃ­veis para chaves de banco
// ---------------------------------------------------------------------------

const LABEL_PAPEL: Record<string, string> = {
  celula:    'LÃ­der de cÃ©lula',
  jovens:    'LÃ­der de jovens',
  pastor:    'Pastor / PresbÃ­tero',
  estudante: 'Estudante de teologia',
  outro:     'Outra lideranÃ§a',
}

const LABEL_REACAO: Record<string, string> = {
  resolve_exato: 'Resolve exatamente',
  parece_util:   'Parece Ãºtil',
  ja_tenho:      'JÃ¡ tenho algo',
  nao_vejo:      'NÃ£o vejo necessidade',
  tenho_receio:  'Tenho receio de IA',
}

const LABEL_PAGAR: Record<string, string> = {
  nao_pagaria: 'NÃ£o pagaria',
  ate_15:      'AtÃ© R$ 15',
  '16_30':     'R$ 16â€“30',
  '31_50':     'R$ 31â€“50',
  mais_50:     'Mais de R$ 50',
}

const LABEL_TENSAO: Record<string, string> = {
  frequente:   'Com frequÃªncia',
  raramente:   'Raramente',
  nao:         'NÃ£o',
  prefiro_nao: 'Prefere nÃ£o responder',
}

const LABEL_FEATURE: Record<string, string> = {
  palavras_originais: 'Palavras originais',
  contexto_historico: 'Contexto histÃ³rico',
  anotacao:           'AnotaÃ§Ãµes integradas',
  esboco_do_estudo:   'EsboÃ§o do estudo',
  historico:          'HistÃ³rico de sermÃµes',
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
          {confirmada ? 'Confirmada' : 'NÃ£o confirmada'}
        </span>
      </div>
    </div>
  )
}

// Sparkline de barras verticais para sÃ©rie por dia
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

      {/* Eixo X â€” apenas primeiro e Ãºltimo */}
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
// PÃ¡gina principal
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
      .catch(() => setErro('NÃ£o foi possÃ­vel carregar os dados.'))
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
      .catch(() => setErro('NÃ£o foi possÃ­vel gerar os insights.'))
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
            Logos DiagnÃ³stico
          </p>
          <h1 style={{
            fontFamily: 'var(--logos-font-display)',
            fontSize: '32px',
            fontWeight: 300,
            color: 'var(--logos-tinta)',
            margin: 0,
          }}>
            VisÃ£o geral
          </h1>
        </header>

        {/* Loading */}
        {loading && (
          <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '14px', color: 'var(--logos-tinta-light)' }}>
            Carregando dadosâ€¦
          </p>
        )}

        {/* Erro */}
        {erro && (
          <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '14px', color: 'var(--logos-erro)' }}>
            {erro}
          </p>
        )}

        {/* ConteÃºdo */}
        {stats && (
          <>
            {/* Cards de topo */}
            <Section titulo="MÃ©tricas principais">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--logos-space-4)',
                marginBottom: 'var(--logos-space-2)',
              }}>
                <StatCard
                  label="Respondentes"
                  value={stats.total}
                  sub="total atÃ© agora"
                />
                <StatCard
                  label="Lista de espera"
                  value={stats.lista}
                  sub={`${stats.taxaConversao}% dos respondentes`}
                  trend="up"
                />
                <StatCard
                  label="Taxa de conversÃ£o"
                  value={`${stats.taxaConversao}%`}
                  trend={stats.taxaConversao >= 50 ? 'up' : 'neutral'}
                />
                <StatCard
                  label="SatisfaÃ§Ã£o mÃ©dia"
                  value={`${stats.satisfacaoMedia}/5`}
                  sub="processo atual do pregador"
                  trend={stats.satisfacaoMedia <= 3 ? 'down' : 'neutral'}
                />
              </div>
            </Section>

            <Section titulo="Funil do formulário">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--logos-space-4)',
                marginBottom: 'var(--logos-space-4)',
              }}>
                <StatCard
                  label="Começaram"
                  value={stats.funil.started}
                  sub="viram a primeira etapa"
                />
                <StatCard
                  label="Concluíram"
                  value={stats.funil.completed}
                  sub="enviaram o formulário"
                  trend={stats.funil.completed > 0 ? 'up' : 'neutral'}
                />
                <StatCard
                  label="Conclusão do funil"
                  value={`${stats.funil.overallCompletionRate}%`}
                  sub="do início até o envio"
                  trend={stats.funil.overallCompletionRate >= 35 ? 'up' : 'neutral'}
                />
                <StatCard
                  label="Maior fuga"
                  value={stats.funil.biggestDropoffStep !== null ? `Etapa ${stats.funil.biggestDropoffStep + 1}` : '—'}
                  sub={stats.funil.biggestDropoffLabel ?? 'Sem dados ainda'}
                  trend={stats.funil.biggestDropoffStep !== null ? 'down' : 'neutral'}
                />
              </div>

              <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
                  {stats.funilPorEtapa.map((etapa) => (
                    <div
                      key={etapa.stepNumber}
                      style={{
                        paddingBottom: 'var(--logos-space-4)',
                        borderBottom: 'var(--logos-border-width-thin) solid var(--logos-border)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 'var(--logos-space-4)',
                        marginBottom: 'var(--logos-space-2)',
                      }}>
                        <div>
                          <p style={{
                            fontFamily: 'var(--logos-font-body)',
                            fontSize: '11px',
                            fontWeight: 500,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--logos-tinta-light)',
                            margin: '0 0 2px',
                          }}>
                            Etapa {etapa.stepNumber + 1}
                          </p>
                          <p style={{
                            fontFamily: 'var(--logos-font-body)',
                            fontSize: '14px',
                            color: 'var(--logos-tinta)',
                            margin: 0,
                          }}>
                            {etapa.stepName}
                          </p>
                        </div>

                        <p style={{
                          fontFamily: 'var(--logos-font-display)',
                          fontSize: '28px',
                          lineHeight: 1,
                          color: 'var(--logos-dourado)',
                          margin: 0,
                        }}>
                          {etapa.completionRate}%
                        </p>
                      </div>

                      <div style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--logos-pergaminho-escuro)',
                        overflow: 'hidden',
                        marginBottom: 'var(--logos-space-3)',
                      }}>
                        <div style={{
                          width: `${etapa.completionRate}%`,
                          height: '100%',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--logos-dourado)',
                        }} />
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 'var(--logos-space-3)',
                      }}>
                        {[
                          { label: 'Viram', value: etapa.viewed },
                          { label: 'Avançaram', value: etapa.continued },
                          { label: 'Fugiram', value: etapa.dropped },
                        ].map((item) => (
                          <div key={item.label} style={{
                            padding: 'var(--logos-space-3)',
                            backgroundColor: 'var(--logos-pergaminho)',
                            borderRadius: 'var(--logos-radius-sm)',
                          }}>
                            <p style={{
                              fontFamily: 'var(--logos-font-body)',
                              fontSize: '10px',
                              fontWeight: 500,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: 'var(--logos-tinta-light)',
                              margin: '0 0 4px',
                            }}>
                              {item.label}
                            </p>
                            <p style={{
                              fontFamily: 'var(--logos-font-display)',
                              fontSize: '24px',
                              lineHeight: 1,
                              color: 'var(--logos-tinta)',
                              margin: 0,
                            }}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>
            {/* SÃ©rie por dia */}
            <Section titulo="Respondentes por dia">
              <Card>
                <Sparkline data={stats.porDia} />
              </Card>
            </Section>

            {/* Grid de distribuiÃ§Ãµes */}
            <Section titulo="DistribuiÃ§Ãµes">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: 'var(--logos-space-4)',
              }}>
                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    ReaÃ§Ã£o ao conceito
                  </p>
                  <BarChart
                    data={toBarData(stats.porReacaoConceito, LABEL_REACAO)}
                    total={stats.total}
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    DisposiÃ§Ã£o a pagar
                  </p>
                  <BarChart
                    data={toBarData(stats.porDisposicaoPagar, LABEL_PAGAR)}
                    total={stats.total}
                    color="var(--logos-sucesso)"
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    Papel / funÃ§Ã£o
                  </p>
                  <BarChart
                    data={toBarData(stats.porPapel, LABEL_PAPEL)}
                    total={stats.total}
                    color="var(--logos-tinta-light)"
                  />
                </Card>

                <Card>
                  <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)', marginBottom: 'var(--logos-space-5)' }}>
                    TensÃ£o no preparo
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

            {/* HipÃ³teses */}
            <Section titulo="HipÃ³teses">
              <Card>
                <HipoteseRow
                  label="H1 â€” TensÃ£o frequente no preparo (meta â‰¥ 40%)"
                  valor={stats.hipoteses.h1.valor}
                  confirmada={stats.hipoteses.h1.confirmada}
                />
                <HipoteseRow
                  label="H3 â€” ReaÃ§Ã£o 'resolve exatamente' (meta â‰¥ 30%)"
                  valor={stats.hipoteses.h3.valor}
                  confirmada={stats.hipoteses.h3.confirmada}
                />
                <HipoteseRow
                  label="H4 â€” 'Palavras originais' como feature #1 (meta: posiÃ§Ã£o 1)"
                  valor={stats.hipoteses.h4.posicao}
                  confirmada={stats.hipoteses.h4.confirmada}
                  tipo="posicao"
                />
                <HipoteseRow
                  label="H5 â€” DisposiÃ§Ã£o a pagar R$ 16â€“50/mÃªs (meta â‰¥ 35%)"
                  valor={stats.hipoteses.h5.valor}
                  confirmada={stats.hipoteses.h5.confirmada}
                />
              </Card>
            </Section>

            {/* AnÃ¡lise IA â€” acionada por botÃ£o */}
            <Section titulo="AnÃ¡lise IA">
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
                    âœ¦
                  </span>
                  <div>
                    <p style={{
                      fontFamily: 'var(--logos-font-body)',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--logos-tinta)',
                      margin: '0 0 2px',
                    }}>
                      Gerar anÃ¡lise com IA
                    </p>
                    <p style={{
                      fontFamily: 'var(--logos-font-body)',
                      fontSize: '12px',
                      color: 'var(--logos-tinta-light)',
                      margin: 0,
                    }}>
                      Insights estratÃ©gicos e recomendaÃ§Ã£o com base nos dados atuais
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
                    Analisando dadosâ€¦
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
                    AnÃ¡lise IA
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
                      RecomendaÃ§Ã£o estratÃ©gica
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

