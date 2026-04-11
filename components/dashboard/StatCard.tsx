interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  /** 'up' = verde, 'down' = vermelho, 'neutral' = dourado */
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, sub, trend = 'neutral' }: StatCardProps) {
  const trendColor = trend === 'up'
    ? 'var(--logos-sucesso)'
    : trend === 'down'
    ? 'var(--logos-erro)'
    : 'var(--logos-dourado)'

  return (
    <div style={{
      backgroundColor: 'var(--logos-papel)',
      border: 'var(--logos-border-width-thin) solid var(--logos-border)',
      borderRadius: 'var(--logos-radius-md)',
      padding: 'var(--logos-space-6)',
      boxShadow: '0 1px 4px rgba(14,14,12,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--logos-space-2)',
    }}>
      <p style={{
        fontFamily: 'var(--logos-font-body)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--logos-tinta-light)',
        margin: 0,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--logos-font-display)',
        fontSize: '36px',
        fontWeight: 300,
        color: trendColor,
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{
          fontFamily: 'var(--logos-font-body)',
          fontSize: '12px',
          color: 'var(--logos-tinta-light)',
          margin: 0,
        }}>
          {sub}
        </p>
      )}
    </div>
  )
}
