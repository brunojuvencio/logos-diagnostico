import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { RespostaRow } from '@/lib/supabase'
import type { DiagnosticoJson } from '@/types/pesquisa'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DiagnosticoPage({ params }: Props) {
  const { id } = await params

  if (!id) redirect('/pesquisa')

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('respostas')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) redirect('/pesquisa')

  const resposta = data as RespostaRow
  const d = resposta.diagnostico_json as DiagnosticoJson

  return (
    <main
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '56px 24px 80px',
        fontFamily: 'Georgia, serif',
        color: '#1a1a1a',
      }}
    >
      {/* Eyebrow */}
      <p
        style={{
          fontSize: '11px',
          fontFamily: 'sans-serif',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#999',
          marginBottom: '40px',
        }}
      >
        Logos Diagnóstico
      </p>

      {/* Subtítulo fixo */}
      <p
        style={{
          fontSize: '13px',
          fontFamily: 'sans-serif',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#b8922a',
          marginBottom: '10px',
        }}
      >
        Seu perfil homilético
      </p>

      {/* Título — perfil_nome */}
      <h1
        style={{
          fontSize: '36px',
          fontWeight: 400,
          lineHeight: '1.2',
          margin: '0 0 40px',
        }}
      >
        {d.perfil_nome}
      </h1>

      <Divider />

      {/* Explicação */}
      <Section label="O que identificamos">
        <Paragrafo>{d.explicacao}</Paragrafo>
      </Section>

      {/* Trava principal — destaque */}
      <div
        style={{
          borderLeft: '3px solid #b8922a',
          paddingLeft: '20px',
          margin: '32px 0',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            fontFamily: 'sans-serif',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#b8922a',
            marginBottom: '8px',
          }}
        >
          A trava principal
        </p>
        <p
          style={{
            fontSize: '17px',
            lineHeight: '1.65',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          {d.trava_principal}
        </p>
      </div>

      <Divider />

      {/* Insight */}
      <Section label="Um padrão que vale observar">
        <Paragrafo>{d.insight}</Paragrafo>
      </Section>

      <Divider />

      {/* Próximo passo */}
      <Section label="Próximo passo">
        <div
          style={{
            backgroundColor: '#faf8f4',
            border: '1px solid #e8e2d6',
            borderRadius: '6px',
            padding: '20px 24px',
          }}
        >
          <Paragrafo style={{ margin: 0 }}>{d.proximo_passo}</Paragrafo>
        </div>
      </Section>

      {/* Footer */}
      <footer
        style={{
          marginTop: '56px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <a
          href="/pesquisa"
          style={{
            fontSize: '11px',
            fontFamily: 'sans-serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#999',
            textDecoration: 'none',
          }}
        >
          ← Refazer
        </a>
        <p
          style={{
            fontSize: '11px',
            fontFamily: 'sans-serif',
            color: '#ccc',
            margin: 0,
          }}
        >
          Logos · {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Componentes auxiliares internos
// ---------------------------------------------------------------------------

function Divider() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #ebe8e2',
        margin: '32px 0',
      }}
    />
  )
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: '8px' }}>
      <p
        style={{
          fontSize: '11px',
          fontFamily: 'sans-serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#999',
          marginBottom: '10px',
        }}
      >
        {label}
      </p>
      {children}
    </section>
  )
}

function Paragrafo({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <p
      style={{
        fontSize: '16px',
        lineHeight: '1.75',
        color: '#2a2a2a',
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  )
}
