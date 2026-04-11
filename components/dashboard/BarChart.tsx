'use client'

interface BarChartProps {
  data: { label: string; value: number }[]
  total: number
  /** Cor da barra — default: dourado */
  color?: string
}

export function BarChart({ data, total, color = 'var(--logos-dourado)' }: BarChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const max = sorted[0]?.value ?? 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--logos-space-3)' }}>
      {sorted.map(({ label, value }) => {
        const pct = Math.round((value / (total || 1)) * 100)
        const barWidth = Math.round((value / max) * 100)

        return (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{
                fontFamily: 'var(--logos-font-body)',
                fontSize: '12px',
                color: 'var(--logos-tinta-mid)',
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: 'var(--logos-font-body)',
                fontSize: '12px',
                color: 'var(--logos-tinta-light)',
              }}>
                {value} <span style={{ opacity: 0.6 }}>({pct}%)</span>
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--logos-pergaminho-escuro)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${barWidth}%`,
                borderRadius: '9999px',
                backgroundColor: color,
                transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
