'use client'

import { useState } from 'react'
import { NavButtons } from '@/components/form/NavButtons'
import { OptionButton } from '@/components/form/OptionButton'
import { QuestionCard } from '@/components/form/QuestionCard'
import type {
  RespostasFormulario,
  Ferramenta,
  Satisfacao,
} from '@/types/pesquisa'

// ---------------------------------------------------------------------------
// Constantes de apresentação
// ---------------------------------------------------------------------------

const STEP_LABELS = ['Sobre você', 'Seu preparo', 'Uma ideia', 'Seu perfil', 'Quase lá']

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--logos-font-body)',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--logos-tinta-mid)',
  marginBottom: 'var(--logos-space-2)',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: 'var(--logos-border-width-default) solid var(--logos-border)',
  borderRadius: 'var(--logos-radius-sm)',
  padding: 'var(--logos-space-3) var(--logos-space-4)',
  fontSize: '14px',
  lineHeight: '1.6',
  color: 'var(--logos-tinta)',
  backgroundColor: 'transparent',
  outline: 'none',
  fontFamily: 'var(--logos-font-body)',
  transition: 'border-color var(--logos-duration-default) var(--logos-ease-default)',
}

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  resize: 'none',
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function PesquisaPage() {
  const [form, setForm] = useState<Partial<RespostasFormulario>>({
    ferramentas: [],
  })
  const [step, setStep] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [erroSubmit, setErroSubmit] = useState<string | null>(null)

  const totalSteps = 5

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  function updateField<K extends keyof RespostasFormulario>(
    key: K,
    value: RespostasFormulario[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleFerramenta(f: Ferramenta) {
    const atual = form.ferramentas ?? []
    const next = atual.includes(f)
      ? atual.filter((x) => x !== f)
      : [...atual, f]
    updateField('ferramentas', next)
  }

  function stepValido(s: number, f: Partial<RespostasFormulario>): boolean {
    switch (s) {
      case 0:
        return !!f.frequencia && !!f.papel
      case 1:
        return (
          !!f.rotina &&
          (f.ferramentas?.length ?? 0) >= 1 &&
          typeof f.satisfacao === 'number' &&
          !!f.tensao
        )
      case 2:
        return !!f.reacao_conceito && !!f.feature_mais_valiosa && !!f.disposicao_pagar
      case 3:
        return !!f.estilo && !!f.desejo_melhoria && !!f.tamanho_congregacao
      case 4:
        return (
          typeof f.nome === 'string' &&
          f.nome.trim().length > 0 &&
          typeof f.optou_lista === 'boolean'
        )
      default:
        return false
    }
  }

  async function handleSubmit() {
    setEnviando(true)
    setErroSubmit(null)
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('Erro ao enviar formulário')
      const data = await response.json()
      window.location.href = `/diagnostico/${data.id}`
    } catch {
      setErroSubmit('Erro ao enviar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Tela de saída — frequência "nunca"
  // ---------------------------------------------------------------------------

  if (form.frequencia === 'nunca') {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--logos-space-6)' }}>
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--logos-font-display)', fontSize: '28px', fontWeight: 300, marginBottom: 'var(--logos-space-4)', color: 'var(--logos-tinta)' }}>
            Obrigado por responder!
          </h1>
          <p style={{ fontFamily: 'var(--logos-font-body)', fontSize: '15px', lineHeight: '1.65', color: 'var(--logos-tinta-mid)', marginBottom: 'var(--logos-space-8)' }}>
            Este diagnóstico foi pensado para quem já prega ou ensina — mas se
            você está pensando em começar, vai adorar o que estamos construindo.
          </p>
          <button
            onClick={() => { updateField('frequencia', 'raramente'); setStep(4) }}
            style={{
              fontFamily: 'var(--logos-font-body)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--logos-vespera)',
              backgroundColor: 'var(--logos-dourado)',
              border: 'none',
              borderRadius: 'var(--logos-radius-sm)',
              padding: 'var(--logos-space-3) var(--logos-space-8)',
              cursor: 'pointer',
            }}
          >
            Me avise quando lançar
          </button>
        </div>
      </main>
    )
  }

  // ---------------------------------------------------------------------------
  // Progresso
  // ---------------------------------------------------------------------------

  const pct = Math.round(((step + 1) / totalSteps) * 100)

  // ---------------------------------------------------------------------------
  // Render principal
  // ---------------------------------------------------------------------------

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>

      {/* Área de conteúdo */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'var(--logos-space-8) var(--logos-space-5) var(--logos-space-10)' }}>

          {/* Barra de progresso */}
          <div style={{ marginBottom: 'var(--logos-space-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--logos-space-2)' }}>
              <span style={{ fontFamily: 'var(--logos-font-body)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--logos-tinta-light)' }}>
                {STEP_LABELS[step]}
              </span>
              <span style={{ fontFamily: 'var(--logos-font-body)', fontSize: '11px', color: 'var(--logos-tinta-light)' }}>
                {pct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Etapa ${step + 1} de ${totalSteps}: ${STEP_LABELS[step]}`}
              style={{ width: '100%', height: '3px', borderRadius: '9999px', backgroundColor: 'var(--logos-pergaminho-escuro)', overflow: 'hidden' }}
            >
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: '9999px',
                backgroundColor: 'var(--logos-dourado)',
                transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>

          {/* ================================================================ */}
          {/* STEP 0 — Sobre você                                             */}
          {/* ================================================================ */}
          {step === 0 && (
            <div key={0} className="step-enter" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
              <QuestionCard
                categoria="Frequência"
                titulo="Com que frequência você prega ou ensina a Bíblia?"
              >
                <OptionButton label="Toda semana"      selected={form.frequencia === 'toda_semana'} onSelect={() => updateField('frequencia', 'toda_semana')} />
                <OptionButton label="A cada 15 dias"   selected={form.frequencia === 'quinzenal'}   onSelect={() => updateField('frequencia', 'quinzenal')} />
                <OptionButton label="Uma vez por mês"  selected={form.frequencia === 'mensal'}      onSelect={() => updateField('frequencia', 'mensal')} />
                <OptionButton label="Raramente"        selected={form.frequencia === 'raramente'}   onSelect={() => updateField('frequencia', 'raramente')} />
                <OptionButton label="Nunca prego"      selected={form.frequencia === 'nunca'}       onSelect={() => updateField('frequencia', 'nunca')} />
              </QuestionCard>

              <QuestionCard
                categoria="Papel"
                titulo="Como você se descreveria hoje?"
              >
                <OptionButton label="Lidero célula ou grupo pequeno"  selected={form.papel === 'celula'}    onSelect={() => updateField('papel', 'celula')} />
                <OptionButton label="Sou líder de jovens / ministério" selected={form.papel === 'jovens'}   onSelect={() => updateField('papel', 'jovens')} />
                <OptionButton label="Sou pastor ou presbítero"         selected={form.papel === 'pastor'}   onSelect={() => updateField('papel', 'pastor')} />
                <OptionButton label="Sou estudante de teologia"        selected={form.papel === 'estudante'} onSelect={() => updateField('papel', 'estudante')} />
                <OptionButton label="Outra função de liderança"        selected={form.papel === 'outro'}    onSelect={() => updateField('papel', 'outro')} />
              </QuestionCard>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 1 — Seu preparo                                            */}
          {/* ================================================================ */}
          {step === 1 && (
            <div key={1} className="step-enter" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
              <QuestionCard
                categoria="Rotina"
                titulo="Quantos dias antes você começa o preparo do sermão?"
              >
                <OptionButton label="5 ou mais dias antes"        selected={form.rotina === 'cinco_mais'}  onSelect={() => updateField('rotina', 'cinco_mais')} />
                <OptionButton label="3 a 4 dias antes"            selected={form.rotina === 'tres_quatro'} onSelect={() => updateField('rotina', 'tres_quatro')} />
                <OptionButton label="1 a 2 dias antes"            selected={form.rotina === 'um_dois'}     onSelect={() => updateField('rotina', 'um_dois')} />
                <OptionButton label="No mesmo dia"                selected={form.rotina === 'mesmo_dia'}   onSelect={() => updateField('rotina', 'mesmo_dia')} />
                <OptionButton label="Não tenho rotina definida"   selected={form.rotina === 'sem_rotina'}  onSelect={() => updateField('rotina', 'sem_rotina')} />
              </QuestionCard>

              <QuestionCard
                categoria="Ferramentas"
                titulo="Quais ferramentas você usa no preparo?"
                descricao="Selecione todas que se aplicam."
              >
                {(
                  [
                    ['biblia',       'Bíblia (física ou digital)'],
                    ['comentarios',  'Comentários bíblicos'],
                    ['strongs',      "Léxico / Strong's"],
                    ['biblegateway', 'BibleGateway ou similar'],
                    ['chatgpt',      'ChatGPT ou IA generativa'],
                    ['banco_sermons','Banco de sermões'],
                    ['youtube',      'YouTube / Podcasts'],
                    ['outro',        'Outro'],
                  ] as [Ferramenta, string][]
                ).map(([value, label]) => (
                  <OptionButton
                    key={value}
                    label={label}
                    modo="checkbox"
                    selected={(form.ferramentas ?? []).includes(value)}
                    onSelect={() => toggleFerramenta(value)}
                  />
                ))}
              </QuestionCard>

              <QuestionCard
                categoria="Satisfação"
                titulo="Como você avalia seu processo de preparo hoje?"
                descricao="1 = muito insatisfeito · 5 = muito satisfeito"
              >
                <div style={{ display: 'flex', gap: 'var(--logos-space-2)' }}>
                  {([1, 2, 3, 4, 5] as Satisfacao[]).map((n) => {
                    const sel = form.satisfacao === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateField('satisfacao', n)}
                        style={{
                          flex: 1,
                          padding: 'var(--logos-space-3)',
                          border: sel
                            ? 'var(--logos-border-width-default) solid var(--logos-border-emphasis)'
                            : 'var(--logos-border-width-default) solid var(--logos-border)',
                          borderRadius: 'var(--logos-radius-sm)',
                          backgroundColor: sel ? 'var(--logos-dourado-faint)' : 'var(--logos-pergaminho)',
                          color: sel ? 'var(--logos-tinta)' : 'var(--logos-tinta-mid)',
                          fontFamily: 'var(--logos-font-body)',
                          fontSize: '16px',
                          fontWeight: sel ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all var(--logos-duration-default) var(--logos-ease-default)',
                          boxShadow: sel ? 'var(--logos-shadow-gold)' : 'none',
                        }}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </QuestionCard>

              <QuestionCard
                categoria="Tensão"
                titulo="Você já chegou na quinta-feira sem ter estudado nada para pregar no domingo?"
              >
                <OptionButton label="Sim, isso acontece com frequência"  selected={form.tensao === 'frequente'}   onSelect={() => updateField('tensao', 'frequente')} />
                <OptionButton label="Já aconteceu algumas vezes"          selected={form.tensao === 'raramente'}   onSelect={() => updateField('tensao', 'raramente')} />
                <OptionButton label="Não — consigo me organizar"          selected={form.tensao === 'nao'}         onSelect={() => updateField('tensao', 'nao')} />
                <OptionButton label="Prefiro não responder"               selected={form.tensao === 'prefiro_nao'} onSelect={() => updateField('tensao', 'prefiro_nao')} />
              </QuestionCard>

              <QuestionCard
                titulo="Qual é a parte do preparo que mais te trava?"
                descricao="Opcional — mas quanto mais honesto, mais preciso o diagnóstico."
              >
                <textarea
                  style={TEXTAREA_STYLE}
                  rows={4}
                  placeholder="Ex: não sei por onde começar, falta tempo, o esboço não sai…"
                  value={form.dificuldade_aberta ?? ''}
                  onChange={(e) => updateField('dificuldade_aberta', e.target.value)}
                />
              </QuestionCard>

              <QuestionCard
                titulo="Se você pudesse mudar uma coisa no seu processo de preparo, o que seria?"
                descricao="Opcional — pode pular."
              >
                <textarea
                  style={TEXTAREA_STYLE}
                  rows={4}
                  placeholder="Escreva livremente…"
                  value={form.mudaria_aberto ?? ''}
                  onChange={(e) => updateField('mudaria_aberto', e.target.value)}
                />
              </QuestionCard>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 2 — O Logos                                                */}
          {/* ================================================================ */}
          {step === 2 && (
            <div key={2} className="step-enter" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
              <QuestionCard categoria="O Logos" titulo="Existe uma ferramenta sendo construída para pregadores como você.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-5)' }}>
                  <p style={{
                    fontFamily: 'var(--logos-font-body)',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: 'var(--logos-tinta-mid)',
                    margin: 0,
                  }}>
                    O Logos é uma Bíblia de estudo com IA integrada. Você abre o texto, estuda a passagem — e o Logos te ajuda a entender o que a palavra original significa, o contexto em que foi escrita, e como isso se conecta com quem vai ouvir você pregar.
                  </p>
                  <blockquote style={{
                    borderLeft: '3px solid var(--logos-dourado)',
                    paddingLeft: 'var(--logos-space-5)',
                    margin: 0,
                    fontFamily: 'var(--logos-font-display)',
                    fontSize: '18px',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    lineHeight: '1.65',
                    color: 'var(--logos-tinta)',
                  }}>
                    "Não é um gerador de sermões. É o estudo que você faria se tivesse mais tempo e mais formação — feito junto com você."
                  </blockquote>
                </div>
              </QuestionCard>

              <QuestionCard titulo="Lendo isso, qual é a sua reação mais honesta?">
                <OptionButton label="Isso resolve exatamente o que preciso"                   descricao="Reconheci minha situação aqui"           selected={form.reacao_conceito === 'resolve_exato'}  onSelect={() => updateField('reacao_conceito', 'resolve_exato')} />
                <OptionButton label="Parece interessante, mas tenho dúvidas sobre como funciona" descricao="Quero entender melhor antes de opinar"  selected={form.reacao_conceito === 'parece_util'}    onSelect={() => updateField('reacao_conceito', 'parece_util')} />
                <OptionButton label="Já uso algo parecido no meu preparo"                     descricao="Tenho um método que funciona"            selected={form.reacao_conceito === 'ja_tenho'}       onSelect={() => updateField('reacao_conceito', 'ja_tenho')} />
                <OptionButton label="Não sinto falta disso no meu processo atual"             descricao="Meu preparo está bem como está"          selected={form.reacao_conceito === 'nao_vejo'}       onSelect={() => updateField('reacao_conceito', 'nao_vejo')} />
                <OptionButton label="Tenho receio de usar IA na preparação de sermões"        descricao="Me preocupa o impacto na minha autoria"  selected={form.reacao_conceito === 'tenho_receio'}   onSelect={() => updateField('reacao_conceito', 'tenho_receio')} />
              </QuestionCard>

              {form.reacao_conceito === 'tenho_receio' && (
                <QuestionCard titulo="O que especificamente te preocupa?" descricao="Opcional — mas sua resposta vai direto para quem está construindo o produto.">
                  <textarea
                    style={TEXTAREA_STYLE}
                    rows={4}
                    placeholder="Ex: tenho medo de depender disso, de pregar algo errado, de perder minha voz…"
                    value={form.receio_aberto ?? ''}
                    onChange={(e) => updateField('receio_aberto', e.target.value)}
                  />
                </QuestionCard>
              )}

              <QuestionCard titulo="Se o Logos existisse hoje, o que você mais usaria?" descricao="Escolha o que resolveria um problema real no seu preparo.">
                <OptionButton
                  label="Entender o que a palavra original significa"
                  descricao="Grego e hebraico sem precisar de dicionário técnico"
                  selected={form.feature_mais_valiosa === 'palavras_originais'}
                  onSelect={() => updateField('feature_mais_valiosa', 'palavras_originais')}
                />
                <OptionButton
                  label="Saber o contexto histórico do que estou pregando"
                  descricao="A situação real do autor e dos primeiros leitores do texto"
                  selected={form.feature_mais_valiosa === 'contexto_historico'}
                  onSelect={() => updateField('feature_mais_valiosa', 'contexto_historico')}
                />
                <OptionButton
                  label="Ter um lugar para anotar enquanto estudo"
                  descricao="Notas por versículo que ficam salvas e organizadas"
                  selected={form.feature_mais_valiosa === 'anotacao'}
                  onSelect={() => updateField('feature_mais_valiosa', 'anotacao')}
                />
                <OptionButton
                  label="Transformar meu estudo em esboço sem começar do zero"
                  descricao="O esboço gerado a partir do que eu anotei — não inventado pela IA"
                  selected={form.feature_mais_valiosa === 'esboco_do_estudo'}
                  onSelect={() => updateField('feature_mais_valiosa', 'esboco_do_estudo')}
                />
                <OptionButton
                  label="Acessar tudo que já estudei em passagens anteriores"
                  descricao="Histórico de sermões e anotações que se acumula com o tempo"
                  selected={form.feature_mais_valiosa === 'historico'}
                  onSelect={() => updateField('feature_mais_valiosa', 'historico')}
                />
              </QuestionCard>

              <QuestionCard titulo="Se o Logos custasse uma mensalidade, quanto faria sentido pagar?" descricao="Considere o valor do que você usaria com mais frequência.">
                <OptionButton label="Não pagaria — só gratuito"    selected={form.disposicao_pagar === 'nao_pagaria'} onSelect={() => updateField('disposicao_pagar', 'nao_pagaria')} />
                <OptionButton label="Até R$ 15/mês"                selected={form.disposicao_pagar === 'ate_15'}      onSelect={() => updateField('disposicao_pagar', 'ate_15')} />
                <OptionButton label="Entre R$ 16 e R$ 30/mês"      selected={form.disposicao_pagar === '16_30'}       onSelect={() => updateField('disposicao_pagar', '16_30')} />
                <OptionButton label="Entre R$ 31 e R$ 50/mês"      selected={form.disposicao_pagar === '31_50'}       onSelect={() => updateField('disposicao_pagar', '31_50')} />
                <OptionButton label="Mais de R$ 50/mês"            selected={form.disposicao_pagar === 'mais_50'}     onSelect={() => updateField('disposicao_pagar', 'mais_50')} />
              </QuestionCard>

              <QuestionCard
                titulo="Tem alguma coisa que te impediria de experimentar?"
                descricao="Opcional — preço, ceticismo, contexto. Qualquer coisa vale."
              >
                <textarea
                  style={TEXTAREA_STYLE}
                  rows={4}
                  placeholder="Escreva o que vier à cabeça — isso vai direto para quem está construindo o produto."
                  value={form.objecao_aberta ?? ''}
                  onChange={(e) => updateField('objecao_aberta', e.target.value)}
                />
              </QuestionCard>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 3 — Seu perfil                                             */}
          {/* ================================================================ */}
          {step === 3 && (
            <div key={3} className="step-enter" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
              <QuestionCard
                categoria="Estilo"
                titulo="Como você descreveria seu estilo de pregação?"
              >
                <OptionButton label="Expositivo"          descricao="Sigo o texto versículo a versículo"         selected={form.estilo === 'expositivo'}   onSelect={() => updateField('estilo', 'expositivo')} />
                <OptionButton label="Temático"            descricao="Escolho um tema e busco textos de suporte"  selected={form.estilo === 'tematico'}     onSelect={() => updateField('estilo', 'tematico')} />
                <OptionButton label="Narrativo"           descricao="Conto histórias e uso muita ilustração"     selected={form.estilo === 'narrativo'}    onSelect={() => updateField('estilo', 'narrativo')} />
                <OptionButton label="Múltiplos estilos"   descricao="Vario conforme a ocasião"                  selected={form.estilo === 'multiestilos'} onSelect={() => updateField('estilo', 'multiestilos')} />
                <OptionButton label="Ainda descobrindo meu estilo"                                               selected={form.estilo === 'descobrindo'}  onSelect={() => updateField('estilo', 'descobrindo')} />
              </QuestionCard>

              <QuestionCard titulo="Qual é o seu maior desejo de melhoria na pregação?">
                <OptionButton label="Aprofundar o estudo bíblico"           selected={form.desejo_melhoria === 'aprofundar_estudo'} onSelect={() => updateField('desejo_melhoria', 'aprofundar_estudo')} />
                <OptionButton label="Falar com mais clareza e objetividade" selected={form.desejo_melhoria === 'clareza'}           onSelect={() => updateField('desejo_melhoria', 'clareza')} />
                <OptionButton label="Ter consistência no preparo semanal"   selected={form.desejo_melhoria === 'consistencia'}      onSelect={() => updateField('desejo_melhoria', 'consistencia')} />
                <OptionButton label="Conectar melhor com a congregação"     selected={form.desejo_melhoria === 'conectar_publico'}  onSelect={() => updateField('desejo_melhoria', 'conectar_publico')} />
                <OptionButton label="Preparar em menos tempo"               selected={form.desejo_melhoria === 'tempo'}             onSelect={() => updateField('desejo_melhoria', 'tempo')} />
              </QuestionCard>

              <QuestionCard titulo="Qual é o tamanho aproximado da sua congregação?">
                <OptionButton label="Até 15 pessoas"          selected={form.tamanho_congregacao === 'ate_15'}    onSelect={() => updateField('tamanho_congregacao', 'ate_15')} />
                <OptionButton label="Entre 15 e 50 pessoas"   selected={form.tamanho_congregacao === '15_50'}     onSelect={() => updateField('tamanho_congregacao', '15_50')} />
                <OptionButton label="Entre 51 e 150 pessoas"  selected={form.tamanho_congregacao === '51_150'}    onSelect={() => updateField('tamanho_congregacao', '51_150')} />
                <OptionButton label="Mais de 150 pessoas"     selected={form.tamanho_congregacao === 'mais_150'}  onSelect={() => updateField('tamanho_congregacao', 'mais_150')} />
              </QuestionCard>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 4 — CTA                                                    */}
          {/* ================================================================ */}
          {step === 4 && (
            <div key={4} className="step-enter" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
              <QuestionCard
                categoria="Última etapa"
                titulo="Seu diagnóstico está pronto. Só falta um detalhe."
                descricao="Seu perfil aparece na tela logo depois — não vai para email, não tem espera."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-4)' }}>
                  <div>
                    <label style={LABEL_STYLE}>Nome *</label>
                    <input
                      type="text"
                      style={INPUT_STYLE}
                      placeholder="Como posso te chamar?"
                      value={form.nome ?? ''}
                      onChange={(e) => updateField('nome', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>
                      WhatsApp{' '}
                      <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
                        (opcional)
                      </span>
                    </label>
                    <input
                      type="tel"
                      style={INPUT_STYLE}
                      placeholder="(00) 00000-0000"
                      value={form.whatsapp ?? ''}
                      onChange={(e) => updateField('whatsapp', e.target.value)}
                    />
                  </div>
                </div>
              </QuestionCard>

              <QuestionCard
                titulo="Quer saber quando o Logos abrir para os primeiros usuários?"
                descricao="Os primeiros a entrar terão condições especiais de lançamento."
              >
                <OptionButton
                  label="Sim — me avise quando abrir"
                  descricao="Você será notificado antes do público geral"
                  selected={form.optou_lista === true}
                  onSelect={() => updateField('optou_lista', true)}
                />
                <OptionButton
                  label="Não, só quero ver meu diagnóstico"
                  selected={form.optou_lista === false}
                  onSelect={() => updateField('optou_lista', false)}
                />
              </QuestionCard>
            </div>
          )}

        </div>
      </div>

      {/* NavButtons — fixo no rodapé */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'var(--logos-papel)',
        borderTop: 'var(--logos-border-width-default) solid var(--logos-border)',
        padding: 'var(--logos-space-4) var(--logos-space-5)',
        boxShadow: '0 -4px 16px rgba(14, 14, 12, 0.06)',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          {erroSubmit && (
            <p style={{
              fontFamily: 'var(--logos-font-body)',
              fontSize: '13px',
              color: '#c0392b',
              marginBottom: 'var(--logos-space-3)',
            }}>
              {erroSubmit}
            </p>
          )}
          <NavButtons
            podevoltar={step > 0}
            onAnterior={prevStep}
            isUltimaEtapa={step === 4}
            podeAvancar={stepValido(step, form)}
            onProximo={step === 4 ? handleSubmit : nextStep}
            enviando={enviando}
          />
        </div>
      </div>

    </main>
  )
}
