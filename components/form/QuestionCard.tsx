import type { ReactNode } from 'react'

interface QuestionCardProps {
  /** Título principal da pergunta */
  titulo: string
  /** Descrição ou instrução opcional */
  descricao?: string
  /** Label de categoria (ex: "Qualificação", "Perfil") — aparece acima do título */
  categoria?: string
  /** Inputs, OptionButtons, etc. */
  children: ReactNode
}

export function QuestionCard({ titulo, descricao, categoria, children }: QuestionCardProps) {
  return (
    <div
      className="w-full rounded-lg bg-brand-papel"
      style={{
        border: 'var(--logos-border-width-thin) solid var(--logos-border)',
        padding: 'var(--logos-space-8) var(--logos-space-6)',
        boxShadow: '0 1px 4px rgba(14, 14, 12, 0.04), 0 0 0 0.5px rgba(184, 149, 42, 0.08)',
      }}
    >
      {/* Cabeçalho */}
      <header className="mb-[var(--logos-space-6)]">
        {categoria && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--logos-space-3)', marginBottom: 'var(--logos-space-3)' }}>
            {/* Acento decorativo dourado */}
            <div style={{
              width: '20px',
              height: '1px',
              backgroundColor: 'var(--logos-dourado)',
              flexShrink: 0,
            }} />
            <p
              className="font-body font-medium uppercase text-brand-dourado"
              style={{ fontSize: '10px', letterSpacing: '0.18em', margin: 0 }}
            >
              {categoria}
            </p>
          </div>
        )}

        <h2
          className="font-display text-text-primario"
          style={{
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 300,
            lineHeight: '1.25',
            letterSpacing: '-0.01em',
            fontStyle: 'normal',
          }}
        >
          {titulo}
        </h2>

        {descricao && (
          <p
            className="font-body text-text-terciario"
            style={{ fontSize: '13px', lineHeight: '1.6', marginTop: 'var(--logos-space-2)' }}
          >
            {descricao}
          </p>
        )}
      </header>

      {/* Divisor sutil */}
      <div
        className="mb-[var(--logos-space-5)]"
        style={{
          height: 'var(--logos-border-width-thin)',
          background: 'linear-gradient(to right, var(--logos-border), transparent)',
        }}
      />

      {/* Conteúdo — inputs, opções, etc. */}
      <div className="flex flex-col gap-[var(--logos-space-3)]">
        {children}
      </div>
    </div>
  )
}
