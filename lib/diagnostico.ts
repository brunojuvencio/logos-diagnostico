/**
 * LOGOS DIAGNÓSTICO — Motor de Diagnóstico (OpenAI Responses API)
 *
 * Promessa central: "Descubra o que está travando a sua pregação."
 *
 * Fluxo:
 *   1. Monta prompt com respostas do formulário
 *   2. Chama OpenAI Responses API com JSON Schema estruturado
 *   3. Valida o shape retornado
 *   4. Em caso de falha, retorna diagnóstico determinístico mínimo
 *
 * Server-side only — não importar em componentes React.
 */

import { openai } from '@/lib/openai'
import type { RespostasFormulario } from '@/types/pesquisa'

// ---------------------------------------------------------------------------
// Contrato público
// ---------------------------------------------------------------------------

export interface ResultadoDiagnostico {
  perfil_gerado: string
  diagnostico_json: Record<string, unknown>
}

interface DiagnosticoShape {
  perfil_nome: string
  explicacao: string
  trava_principal: string
  insight: string
  proximo_passo: string
}

// ---------------------------------------------------------------------------
// JSON Schema para saída estruturada
// ---------------------------------------------------------------------------

const DIAGNOSTICO_SCHEMA = {
  type: 'object',
  properties: {
    perfil_nome:     { type: 'string' },
    explicacao:      { type: 'string' },
    trava_principal: { type: 'string' },
    insight:         { type: 'string' },
    proximo_passo:   { type: 'string' },
  },
  required: ['perfil_nome', 'explicacao', 'trava_principal', 'insight', 'proximo_passo'],
  additionalProperties: false,
} as const

// ---------------------------------------------------------------------------
// Montagem do prompt
// ---------------------------------------------------------------------------

const LABEL_FREQUENCIA: Record<string, string> = {
  toda_semana: 'toda semana',
  quinzenal:   'a cada 15 dias',
  mensal:      'mensalmente',
  raramente:   'raramente',
  nunca:       'nunca',
}

const LABEL_PAPEL: Record<string, string> = {
  celula:    'líder de célula/grupo pequeno',
  jovens:    'líder de jovens/ministério',
  pastor:    'pastor ou presbítero',
  estudante: 'estudante de teologia',
  outro:     'outra função de liderança',
}

const LABEL_ROTINA: Record<string, string> = {
  cinco_mais: '5 ou mais dias antes',
  tres_quatro: '3 a 4 dias antes',
  um_dois:    '1 a 2 dias antes',
  mesmo_dia:  'no mesmo dia',
  sem_rotina: 'sem rotina definida',
}

const LABEL_TENSAO: Record<string, string> = {
  frequente:   'frequentemente',
  raramente:   'raramente',
  nao:         'não sente tensão',
  prefiro_nao: 'prefere não responder',
}

const LABEL_ESTILO: Record<string, string> = {
  expositivo:  'expositivo (segue o texto versículo a versículo)',
  tematico:    'temático (escolhe um tema e busca textos de suporte)',
  narrativo:   'narrativo (conta histórias, usa muita ilustração)',
  multiestilos: 'múltiplos estilos (varia conforme a ocasião)',
  descobrindo: 'ainda descobrindo seu estilo',
}

const LABEL_DESEJO: Record<string, string> = {
  aprofundar_estudo: 'aprofundar o estudo bíblico',
  clareza:          'falar com mais clareza e objetividade',
  consistencia:     'ter consistência no preparo semanal',
  conectar_publico: 'conectar melhor com a congregação',
  tempo:            'preparar em menos tempo',
}

const LABEL_REACAO: Record<string, string> = {
  resolve_exato: 'resolve exatamente o que precisa',
  parece_util:   'parece útil, mas tem dúvidas',
  ja_tenho:      'já tem algo que faz isso',
  nao_vejo:      'não vê necessidade',
  tenho_receio:  'tem receio de usar IA para isso',
}

function montarPrompt(r: RespostasFormulario): string {
  // Nome sanitizado — remove caracteres que poderiam quebrar o JSON
  const nome = r.nome.trim().replace(/["\\]/g, '')

  const linhas = [
    `Nome do pregador: ${nome}`,
    ``,
    `=== PADRÃO DE PREGAÇÃO ===`,
    `Frequência: ${LABEL_FREQUENCIA[r.frequencia] ?? r.frequencia}`,
    `Papel: ${LABEL_PAPEL[r.papel] ?? r.papel}`,
    `Estilo de pregação: ${LABEL_ESTILO[r.estilo] ?? r.estilo}`,
    ``,
    `=== ROTINA DE PREPARO ===`,
    `Começa o preparo: ${LABEL_ROTINA[r.rotina] ?? r.rotina}`,
    `Satisfação com o processo atual: ${r.satisfacao}/5`,
    `Ferramentas usadas: ${r.ferramentas.length > 0 ? r.ferramentas.join(', ') : 'nenhuma mencionada'}`,
    ``,
    `=== TENSÃO E DOR ===`,
    `Tensão no preparo: ${LABEL_TENSAO[r.tensao] ?? r.tensao}`,
    `Maior desejo de melhoria: ${LABEL_DESEJO[r.desejo_melhoria] ?? r.desejo_melhoria}`,
    ``,
    `=== REAÇÃO AO PRODUTO ===`,
    `Reação ao conceito do Logos: ${LABEL_REACAO[r.reacao_conceito] ?? r.reacao_conceito}`,
  ]

  // Respostas abertas — as mais valiosas para diagnóstico preciso
  if (r.dificuldade_aberta?.trim()) {
    linhas.push(``, `=== VOZ DO PREGADOR (respostas abertas) ===`)
    linhas.push(`O que trava o preparo (nas palavras dele): "${r.dificuldade_aberta.trim()}"`)
  }
  if (r.mudaria_aberto?.trim()) {
    linhas.push(`O que mudaria no processo: "${r.mudaria_aberto.trim()}"`)
  }
  if (r.receio_aberto?.trim()) {
    linhas.push(`Receio sobre uso de IA: "${r.receio_aberto.trim()}"`)
  }

  linhas.push(``, `Use o nome "${nome}" de forma natural em explicacao, trava_principal e proximo_passo. Não use no perfil_nome. Não repita mais de 2 vezes no total.`)

  return linhas.join('\n')
}

const SYSTEM_PROMPT = `Você é um especialista em desenvolvimento de pregadores. Sua função é ler as respostas de um pregador e gerar um diagnóstico preciso e pessoal — não um resumo das respostas, mas uma interpretação do padrão que elas revelam.

A pergunta central que você deve responder é: "O que está travando a pregação desta pessoa?"

== REGRAS DE QUALIDADE ==

PROIBIDO:
- Linguagem genérica ("você pode melhorar", "é importante considerar", "em alguns casos")
- Resumir ou listar as respostas do usuário
- Tom neutro, motivacional ou de coaching genérico
- Repetir o nome do pregador mais de 2 vezes no diagnóstico completo

OBRIGATÓRIO:
- Diagnóstico baseado no padrão das respostas, não nas respostas em si
- Trava nomeada com precisão cirúrgica — o pregador deve sentir que foi visto
- Linguagem direta, humana, sem jargão técnico ou espiritual excessivo
- Português do Brasil, tom de mentor experiente que fala a verdade com respeito

== LÓGICA DE INTERPRETAÇÃO ==

Interprete os padrões, não os dados:
- Frequência alta + tensão alta = sobrecarga sistêmica, não falta de dedicação
- Preparo no mesmo dia ou sem rotina = ausência de método, não preguiça
- Estilo narrativo + pressão = improviso como padrão, não estilo
- Satisfação baixa + ferramentas muitas = busca por atalho, não por profundidade
- Desejo de consistência + rotina frágil = o problema é sistema, não motivação
- Reação "parece útil mas tenho dúvidas" = postura de quem já foi decepcionado antes

== CAMPOS A RETORNAR ==

perfil_nome:
- 2 a 4 palavras. Memorável. Descritivo do padrão central.
- Exemplos: "Narrativo sobrecarregado", "Expositivo travado", "Pregador sem sistema", "Criador inconsistente"
- NÃO usar o nome da pessoa aqui

explicacao:
- 2 a 3 frases. Descrever o comportamento real revelado pelas respostas.
- Deve parecer uma observação direta, não um resumo.
- Usar o nome de forma natural se caber bem (ex: "Gabriel, pela forma como você respondeu...")
- Não começar com "Você respondeu que" ou "Com base nas suas respostas"

trava_principal:
- Este é o campo mais importante. Responde diretamente: "o que está travando a pregação desta pessoa?"
- 1 a 2 frases. Clara, específica, levemente confrontadora.
- Deve nomear o obstáculo real — não o sintoma, mas a causa.
- Usar o nome aqui funciona bem: "Gabriel, o que está travando sua pregação é..."
- Evitar eufemismos. Se é falta de sistema, diz falta de sistema. Se é sobrecarga, nomeia.

insight:
- 1 a 2 frases. Revelar algo que o pregador provavelmente não percebeu sozinho.
- Conectar comportamento com consequência não óbvia.
- Exemplo: "Você compensa falta de estrutura com criatividade — o que funciona até a criatividade falhar."
- Não usar o nome aqui.

proximo_passo:
- 1 ação. Simples, específica, aplicável esta semana.
- Não um conselho vago. Uma coisa concreta.
- Pode usar o nome se soar natural.
- Exemplo: "Antes do próximo sermão, separe 20 minutos só para ler o texto em voz alta — sem esboço, sem anotações. Só o texto."`

// ---------------------------------------------------------------------------
// Validação mínima do shape retornado
// ---------------------------------------------------------------------------

function isDiagnosticoValido(obj: unknown): obj is DiagnosticoShape {
  if (!obj || typeof obj !== 'object') return false
  const d = obj as Record<string, unknown>
  return (
    typeof d.perfil_nome     === 'string' && d.perfil_nome.trim()     !== '' &&
    typeof d.explicacao      === 'string' && d.explicacao.trim()      !== '' &&
    typeof d.trava_principal === 'string' && d.trava_principal.trim() !== '' &&
    typeof d.insight         === 'string' && d.insight.trim()         !== '' &&
    typeof d.proximo_passo   === 'string' && d.proximo_passo.trim()   !== ''
  )
}

// ---------------------------------------------------------------------------
// Fallback determinístico mínimo — usado se a OpenAI falhar
// ---------------------------------------------------------------------------

function diagnosticoFallback(r: RespostasFormulario): DiagnosticoShape {
  const altaTensao   = r.tensao === 'frequente'
  const altaFreq     = r.frequencia === 'toda_semana' || r.frequencia === 'quinzenal'
  const semRotina    = r.rotina === 'mesmo_dia' || r.rotina === 'sem_rotina'

  if (altaFreq && altaTensao) {
    return {
      perfil_nome:     'O Expositor Sobrecarregado',
      explicacao:      'Você prega com alta frequência e sente tensão constante no preparo. O volume de demandas consome o espaço necessário para aprofundamento.',
      trava_principal: 'A pressão semanal não deixa espaço para estudar com profundidade — você prepara para entregar, não para descobrir.',
      insight:         'O problema não é disciplina: é um sistema que não escala com a demanda.',
      proximo_passo:   'Antes do próximo sermão, separe 30 minutos só para ler o texto sem nenhuma intenção de pregar. Sem esboço. Só o texto.',
    }
  }

  if (semRotina) {
    return {
      perfil_nome:     'O Pregador sem Sistema',
      explicacao:      'O preparo acontece no limite do tempo disponível. Não é falta de dedicação — é ausência de um método que funcione para a sua rotina.',
      trava_principal: 'Sem um sistema mínimo, cada sermão começa do zero. O esforço se repete sem gerar acumulação.',
      insight:         'Você tem mais conteúdo do que imagina — ele só não está organizado. O problema é recuperação, não geração.',
      proximo_passo:   'Crie uma pasta onde qualquer ideia, versículo ou história que chamar sua atenção esta semana seja registrada. Só isso por agora.',
    }
  }

  return {
    perfil_nome:     'O Pregador em Desenvolvimento',
    explicacao:      'Você tem comprometimento com a pregação e busca crescer. O diagnóstico completo estará disponível em breve.',
    trava_principal: 'O próximo nível exige identificar com precisão onde está o gargalo no seu processo.',
    insight:         'Pregadores que crescem de forma consistente geralmente têm um sistema simples — não necessariamente mais tempo.',
    proximo_passo:   'Documente como você prepara o próximo sermão, passo a passo. Esse mapa vai revelar onde o processo trava.',
  }
}

// ---------------------------------------------------------------------------
// Função principal — contrato público
// ---------------------------------------------------------------------------

export async function gerarDiagnostico(
  respostas: RespostasFormulario,
): Promise<ResultadoDiagnostico> {
  let shape: DiagnosticoShape

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: montarPrompt(respostas) },
      ],
      text: {
        format: {
          type:        'json_schema',
          name:        'diagnostico',
          strict:      true,
          schema:      DIAGNOSTICO_SCHEMA,
        },
      },
    })

    const parsed: unknown = JSON.parse(response.output_text)

    if (!isDiagnosticoValido(parsed)) {
      throw new Error('Shape inválido retornado pela OpenAI.')
    }

    shape = parsed
  } catch (err) {
    console.error('[diagnostico] Falha na OpenAI — usando fallback:', err)
    shape = diagnosticoFallback(respostas)
  }

  return {
    perfil_gerado:   shape.perfil_nome,
    diagnostico_json: {
      perfil_nome:     shape.perfil_nome,
      explicacao:      shape.explicacao,
      trava_principal: shape.trava_principal,
      insight:         shape.insight,
      proximo_passo:   shape.proximo_passo,
    },
  }
}
