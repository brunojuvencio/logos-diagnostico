import type { ReactNode } from 'react'

interface StepWrapperProps {
  children: ReactNode
  /** Número da etapa atual (1-based) */
  step: number
  /** Total de etapas */
  totalSteps: number
}

export function StepWrapper({ children, step, totalSteps }: StepWrapperProps) {
  const progresso = Math.round((step / totalSteps) * 100)

  return (
    <div
      className="min-h-screen bg-brand-papel flex flex-col items-center justify-start px-[var(--logos-page-padding-mobile)] py-[var(--logos-space-10)] md:px-[var(--logos-page-padding-tablet)] md:py-[var(--logos-space-12)]"
    >
      {/* Barra de progresso */}
      <div className="w-full max-w-[var(--logos-max-width-content)] mb-[var(--logos-space-8)]">
        <div className="flex items-center justify-between mb-[var(--logos-space-2)]">
          <span
            className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-text-terciario"
          >
            Etapa {step} de {totalSteps}
          </span>
          <span
            className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-text-terciario"
          >
            {progresso}%
          </span>
        </div>

        {/* Track da barra */}
        <div
          className="w-full h-px bg-brand-pergaminho-escuro overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-brand-dourado rounded-full"
            style={{
              width: `${progresso}%`,
              transition: `width var(--logos-duration-slow) var(--logos-ease-default)`,
            }}
          />
        </div>
      </div>

      {/* Conteúdo da etapa */}
      <main className="w-full max-w-[var(--logos-max-width-content)] flex flex-col gap-[var(--logos-space-6)]">
        {children}
      </main>
    </div>
  )
}
