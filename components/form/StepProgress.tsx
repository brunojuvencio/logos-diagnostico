interface StepProgressProps {
  /** Índice 0-based do step atual */
  stepAtual: number
  /** Labels dos steps em ordem */
  steps: string[]
}

export function StepProgress({ stepAtual, steps }: StepProgressProps) {
  const total = steps.length

  return (
    <nav
      aria-label={`Progresso: etapa ${stepAtual + 1} de ${total}, ${steps[stepAtual]}`}
      className="w-full max-w-[var(--logos-max-width-content)]"
    >
      {/*
        Label atual + contador
        aria-hidden: a informação já está no aria-label do <nav>
      */}
      <div
        className="flex items-center justify-between mb-[var(--logos-space-3)]"
        aria-hidden="true"
      >
        <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-text-terciario">
          {steps[stepAtual]}
        </span>
        <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-text-terciario">
          {stepAtual + 1}&thinsp;/&thinsp;{total}
        </span>
      </div>

      {/*
        Track segmentado — puramente decorativo
        aria-hidden: leitor de tela já recebe o contexto do <nav>
      */}
      <div
        className="flex items-center gap-[var(--logos-space-1)]"
        aria-hidden="true"
      >
        {steps.map((_, i) => {
          const preenchido = i <= stepAtual

          return (
            <div
              key={i}
              className={[
                'flex-1 rounded-full',
                i === stepAtual ? 'h-0.5' : 'h-px',
                preenchido ? 'bg-brand-dourado' : 'bg-brand-pergaminho-escuro',
              ].join(' ')}
              style={{
                // inline style mantido: transition combina duas propriedades
                // com durações distintas — não expressável em Tailwind utilitário
                transition: `
                  background-color var(--logos-duration-slow) var(--logos-ease-default),
                  height          var(--logos-duration-default) var(--logos-ease-default)
                `,
              }}
            />
          )
        })}
      </div>

      {/*
        Labels — apenas desktop, decorativo
        aria-hidden: o estado semântico já está no <nav> aria-label
      */}
      <div
        className="hidden md:flex items-start mt-[var(--logos-space-2)]"
        aria-hidden="true"
      >
        {steps.map((label, i) => {
          const concluido = i < stepAtual
          const ativo     = i === stepAtual

          const colorClass  = concluido ? 'text-brand-dourado'
                            : ativo     ? 'text-text-secundario'
                            :             'text-text-desativado'

          const weightClass = ativo ? 'font-medium' : 'font-normal'

          const alignClass  = i === 0         ? 'text-left'
                            : i === total - 1 ? 'text-right'
                            :                   'text-center'

          return (
            <span
              key={i}
              className={`flex-1 font-body text-[10px] uppercase tracking-[0.08em] ${weightClass} ${colorClass} ${alignClass}`}
              style={{
                // inline style mantido: Tailwind não suporta transition-color
                // com easing/duration via CSS variables em uma única classe
                transition: `color var(--logos-duration-default) var(--logos-ease-default)`,
              }}
            >
              {label}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
