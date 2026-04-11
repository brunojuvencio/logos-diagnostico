/**
 * LOGOS DIAGNÓSTICO — Tipos do Formulário de Pesquisa
 * Fonte de verdade: spec v1.0
 * NÃO adicionar campos fora da spec sem alinhamento.
 */

// ---------------------------------------------------------------------------
// BLOCO: Qualificação
// ---------------------------------------------------------------------------

export type Frequencia =
  | 'toda_semana'
  | 'quinzenal'
  | 'mensal'
  | 'raramente'
  | 'nunca'

export type Papel =
  | 'celula'
  | 'jovens'
  | 'pastor'
  | 'estudante'
  | 'outro'

export interface BlocoQualificacao {
  frequencia: Frequencia
  papel: Papel
}

// ---------------------------------------------------------------------------
// BLOCO: Contexto e Dor
// ---------------------------------------------------------------------------

export type Rotina =
  | 'cinco_mais'
  | 'tres_quatro'
  | 'um_dois'
  | 'mesmo_dia'
  | 'sem_rotina'

export type Ferramenta =
  | 'biblia'
  | 'comentarios'
  | 'strongs'
  | 'biblegateway'
  | 'chatgpt'
  | 'banco_sermons'
  | 'youtube'
  | 'outro'

export type Satisfacao = 1 | 2 | 3 | 4 | 5

export type Tensao =
  | 'frequente'
  | 'raramente'
  | 'nao'
  | 'prefiro_nao'

export interface BlocoContextoDor {
  rotina: Rotina
  dificuldade_aberta: string
  ferramentas: Ferramenta[]
  satisfacao: Satisfacao
  mudaria_aberto: string
  tensao: Tensao
}

// ---------------------------------------------------------------------------
// BLOCO: Reação ao Conceito
// ---------------------------------------------------------------------------

export type ReacaoConceito =
  | 'resolve_exato'
  | 'parece_util'
  | 'ja_tenho'
  | 'nao_vejo'
  | 'tenho_receio'

export type FeatureValiosa =
  | 'palavras_originais'
  | 'contexto_historico'
  | 'anotacao'
  | 'esboco_do_estudo'
  | 'historico'

export type DisposicaoPagar =
  | 'nao_pagaria'
  | 'ate_15'
  | '16_30'
  | '31_50'
  | 'mais_50'

export interface BlocoReacaoConceito {
  reacao_conceito: ReacaoConceito
  receio_aberto: string
  feature_mais_valiosa: FeatureValiosa
  disposicao_pagar: DisposicaoPagar
  objecao_aberta: string
}

// ---------------------------------------------------------------------------
// BLOCO: Perfil
// ---------------------------------------------------------------------------

export type Estilo =
  | 'expositivo'
  | 'tematico'
  | 'narrativo'
  | 'multiestilos'
  | 'descobrindo'

export type DesejoMelhoria =
  | 'aprofundar_estudo'
  | 'clareza'
  | 'consistencia'
  | 'conectar_publico'
  | 'tempo'

export type TamanhoCongregacao =
  | 'ate_15'
  | '15_50'
  | '51_150'
  | 'mais_150'

export interface BlocoPerfil {
  estilo: Estilo
  desejo_melhoria: DesejoMelhoria
  tamanho_congregacao: TamanhoCongregacao
}

// ---------------------------------------------------------------------------
// BLOCO: CTA
// ---------------------------------------------------------------------------

export interface BlocoCTA {
  nome: string
  whatsapp?: string
  optou_lista: boolean
}

// ---------------------------------------------------------------------------
// TIPOS PRINCIPAIS
// ---------------------------------------------------------------------------

/**
 * Campos preenchidos pelo usuário durante o formulário.
 * Não inclui dados gerados pelo sistema.
 */
export interface RespostasFormulario
  extends BlocoQualificacao,
    BlocoContextoDor,
    BlocoReacaoConceito,
    BlocoPerfil,
    BlocoCTA {}

/**
 * Perfil gerado pela lógica de diagnóstico (lib/diagnostico.ts).
 * @todo Substituir por union type concreto após lib/diagnostico.ts ser fornecido.
 */
export type PerfilGerado = string

/**
 * Resultado estruturado do diagnóstico gerado por `lib/diagnostico.ts`.
 * Cada campo entrega valor psicológico direto ao pregador.
 */
export interface DiagnosticoJson {
  /** Nome do perfil identificado (ex: "Expositor sobrecarregado") */
  perfil_nome: string
  /** Explicação de por que esse perfil foi atribuído */
  explicacao: string
  /** Principal obstáculo identificado nas respostas */
  trava_principal: string
  /** Observação mais profunda sobre o padrão de comportamento */
  insight: string
  /** Ação concreta e imediata recomendada */
  proximo_passo: string
}

/**
 * Registro completo salvo após processamento — inclui resposta do usuário
 * mais os dados gerados pelo sistema de diagnóstico.
 */
export interface RespostaCompleta extends RespostasFormulario {
  perfil_gerado: PerfilGerado
  diagnostico_json: DiagnosticoJson
}
