'use client'

interface NavButtonsProps {
  /** Mostra o botão "Anterior" */
  podevoltar: boolean
  /** Callback do botão "Anterior" */
  onAnterior: () => void
  /** Se true, exibe "Enviar" no lugar de "Próximo" */
  isUltimaEtapa?: boolean
  /** Desabilita o botão avançar/enviar (ex: seleção obrigatória não feita) */
  podeAvancar: boolean
  /** Callback do botão "Próximo" ou "Enviar" */
  onProximo: () => void
  /** Estado de loading durante o submit */
  enviando?: boolean
}

export function NavButtons({
  podevoltar,
  onAnterior,
  isUltimaEtapa = false,
  podeAvancar,
  onProximo,
  enviando = false,
}: NavButtonsProps) {
  const labelAvancar = isUltimaEtapa
    ? enviando ? 'Enviando…' : 'Ver meu diagnóstico'
    : 'Próximo'

  const avancarDesabilitado = !podeAvancar || enviando

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--logos-space-4)',
    }}>

      {/* Botão Anterior */}
      {podevoltar ? (
        <button
          type="button"
          onClick={onAnterior}
          className="font-body"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--logos-tinta-light)',
            background: 'transparent',
            border: 'none',
            padding: 'var(--logos-space-3) 0',
            cursor: 'pointer',
            transition: `color var(--logos-duration-default) var(--logos-ease-default)`,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--logos-space-2)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--logos-tinta-mid)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--logos-tinta-light)' }}
        >
          <span style={{ fontSize: '14px' }}>←</span>
          Anterior
        </button>
      ) : (
        <div aria-hidden="true" />
      )}

      {/* Botão Próximo / Enviar */}
      <button
        type="button"
        onClick={avancarDesabilitado ? undefined : onProximo}
        disabled={avancarDesabilitado}
        className="font-body"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: avancarDesabilitado ? 'var(--logos-tinta-faint)' : 'var(--logos-vespera)',
          backgroundColor: avancarDesabilitado
            ? 'var(--logos-pergaminho-escuro)'
            : 'var(--logos-dourado)',
          border: 'none',
          borderRadius: 'var(--logos-radius-sm)',
          padding: 'var(--logos-space-3) var(--logos-space-8)',
          cursor: avancarDesabilitado ? 'not-allowed' : 'pointer',
          minWidth: '140px',
          textAlign: 'center',
          transition: `
            background-color var(--logos-duration-default) var(--logos-ease-default),
            color var(--logos-duration-default) var(--logos-ease-default)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--logos-space-2)',
        }}
        onMouseEnter={(e) => {
          if (avancarDesabilitado) return
          e.currentTarget.style.backgroundColor = 'var(--logos-dourado-claro)'
        }}
        onMouseLeave={(e) => {
          if (avancarDesabilitado) return
          e.currentTarget.style.backgroundColor = 'var(--logos-dourado)'
        }}
      >
        {enviando ? (
          <>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '9999px',
              border: '1.5px solid var(--logos-vespera)',
              borderTopColor: 'transparent',
              animation: 'spin 600ms linear infinite',
            }} />
            Enviando
          </>
        ) : (
          <>
            {labelAvancar}
            {!isUltimaEtapa && <span style={{ fontSize: '14px' }}>→</span>}
          </>
        )}
      </button>

      {/* Keyframe do spinner — injetado inline para não poluir o globals */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

    </div>
  )
}
