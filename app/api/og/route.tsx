/**
 * GET /api/og?ad=A1&format=square   → 1080×1080 (padrão)
 * GET /api/og?ad=A1&format=story    → 1080×1920
 * Criativos para Meta Ads.
 * Ads: A1–A6
 */

import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Copies
// ---------------------------------------------------------------------------

const ADS = {
  A1: {
    lines: ['Você estuda horas', 'e o sermão ainda não sai.'],
    apoio: 'Faça um diagnóstico gratuito e descubra exatamente onde seu preparo trava.',
    cta: 'Descobrir onde estou travando',
  },
  A2: {
    lines: ['Você entendeu a passagem', 'mas a mensagem não chegou.'],
    apoio: 'Faça um diagnóstico gratuito e descubra por que sua mensagem perde força no caminho.',
    cta: 'Ver onde perco clareza',
  },
  A3: {
    lines: ['Todo domingo você prega', 'sem se sentir preparado.'],
    apoio: 'Faça um diagnóstico gratuito e entenda o padrão que te faz pregar sempre no limite.',
    cta: 'Entender meu padrão',
  },
  A4: {
    lines: ['Você relê o texto', 'e ainda não sabe o que pregar.'],
    apoio: 'Faça um diagnóstico gratuito e descubra o que falta para sua pregação ganhar profundidade.',
    cta: 'Descobrir o que me falta',
  },
  A5: {
    lines: ['Você prega toda semana', 'e a insegurança não passa.'],
    apoio: 'Faça um diagnóstico gratuito e descubra a causa real da sua insegurança no púlpito.',
    cta: 'Descobrir minha causa',
  },
  A6: {
    lines: ['Você prega há anos', 'e ainda não sabe o que te trava.'],
    apoio: 'Faça um diagnóstico gratuito e descubra em 5 minutos o que está te travando.',
    cta: 'Descobrir meu perfil',
  },
} as const

type AdId = keyof typeof ADS

// ---------------------------------------------------------------------------
// Fontes
// ---------------------------------------------------------------------------

async function loadFont(family: string, weight: number, italic: boolean): Promise<ArrayBuffer | null> {
  try {
    const ital = italic ? 'ital,' : ''
    const wght = italic ? `1,${weight}` : `${weight}`
    const css  = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${ital}wght@${wght}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } },
    ).then((r) => r.text())
    const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (!url) return null
    return fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const id     = (req.nextUrl.searchParams.get('ad') ?? 'A1').toUpperCase() as AdId
  const format = req.nextUrl.searchParams.get('format') ?? 'square'
  const ad     = ADS[id] ?? ADS.A1

  const isStory = format === 'story'
  const width   = 1080
  const height  = isStory ? 1920 : 1080

  const [cormorant, dmSans400, dmSans500] = await Promise.all([
    loadFont('Cormorant Garamond', 300, true),
    loadFont('DM Sans', 400, false),
    loadFont('DM Sans', 500, false),
  ])

  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts'] = [
    cormorant  && { name: 'Cormorant Garamond', data: cormorant,  weight: 300 as const, style: 'italic' as const },
    dmSans400  && { name: 'DM Sans',            data: dmSans400,  weight: 400 as const, style: 'normal' as const },
    dmSans500  && { name: 'DM Sans',            data: dmSans500,  weight: 500 as const, style: 'normal' as const },
  ].filter(Boolean) as NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']

  return new ImageResponse(
    <Ad
      lines={ad.lines as unknown as string[]}
      apoio={ad.apoio}
      cta={ad.cta}
      width={width}
      height={height}
    />,
    { width, height, fonts },
  )
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function Ad({
  lines,
  apoio,
  cta,
  width,
  height,
}: {
  lines: string[]
  apoio: string
  cta: string
  width: number
  height: number
}) {
  const GOLD      = '#B8952A'
  const GOLD_DIM  = 'rgba(184,149,42,0.30)'
  const GOLD_GLOW = 'rgba(184,149,42,0.08)'
  const TEXT      = '#F5F1E8'
  const TEXT_MID  = '#A8A398'

  const isStory      = height > width
  const headlinePx   = isStory ? 96  : 84
  const apoioPx      = isStory ? 28  : 22
  const padding      = isStory ? 112 : 96
  const accentMB     = isStory ? 56  : 44
  const headlineMB   = isStory ? 56  : 48
  const ctaBottom    = isStory ? 140 : 88
  const sepBottom    = isStory ? 240 : 164
  const heroBottom   = isStory ? 280 : 180

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        position: 'relative',
        backgroundImage: 'linear-gradient(158deg, #232016 0%, #1A1710 42%, #0D0C09 100%)',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >

      {/* ── Glow radial superior direito ── */}
      <div style={{
        position: 'absolute', top: -160, right: -140,
        width: 680, height: 680, borderRadius: '50%',
        backgroundImage: `radial-gradient(circle, rgba(184,149,42,0.11) 0%, ${GOLD_GLOW} 45%, transparent 70%)`,
      }} />

      {/* ── Glow radial inferior esquerdo ── */}
      <div style={{
        position: 'absolute', bottom: -200, left: -100,
        width: 500, height: 500, borderRadius: '50%',
        backgroundImage: 'radial-gradient(circle, rgba(184,149,42,0.06) 0%, transparent 65%)',
      }} />

      {/* ── Linha vertical dourada (borda esquerda) ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 3, height: '100%',
        backgroundImage: `linear-gradient(to bottom, transparent 0%, ${GOLD} 25%, ${GOLD} 75%, transparent 100%)`,
        opacity: 0.45,
      }} />

      {/* ── Cantoneira: superior direita ── */}
      <div style={{ display: 'flex', position: 'absolute', top: 72, right: 72, width: 40, height: 40 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 1.5, backgroundColor: GOLD_DIM }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1.5, height: 40, backgroundColor: GOLD_DIM }} />
      </div>

      {/* ── Cantoneira: inferior esquerda ── */}
      <div style={{ display: 'flex', position: 'absolute', bottom: 72, left: 72, width: 40, height: 40 }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 1.5, backgroundColor: GOLD_DIM }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1.5, height: 40, backgroundColor: GOLD_DIM }} />
      </div>

      {/* ── Grade de pontos: canto inferior direito ── */}
      <div style={{
        position: 'absolute', bottom: 88, right: 80,
        display: 'flex', flexWrap: 'wrap', width: 120, gap: 13,
        opacity: 0.15,
      }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: GOLD }} />
        ))}
      </div>

      {/* ── Linha separadora horizontal ── */}
      <div style={{
        position: 'absolute', bottom: sepBottom, left: padding, right: padding, height: 1,
        backgroundImage: `linear-gradient(to right, ${GOLD} 0%, rgba(184,149,42,0.18) 55%, transparent 100%)`,
      }} />

      {/* ── Hero: acento + headline + apoio ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: heroBottom,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: `0 ${padding}px`,
      }}>

        {/* Acento */}
        <div style={{
          width: 48, height: 2, marginBottom: accentMB, borderRadius: 2,
          backgroundImage: `linear-gradient(to right, rgba(184,149,42,0.2), ${GOLD}, rgba(184,149,42,0.2))`,
        }} />

        {/* Headline */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontStyle: 'italic', fontWeight: 300,
          fontSize: headlinePx, lineHeight: 1.08,
          color: TEXT, marginBottom: headlineMB,
          textAlign: 'center',
        }}>
          {lines.map((line, i) => (
            <span key={i} style={{ display: 'block', textAlign: 'center' }}>{line}</span>
          ))}
        </div>

        {/* Apoio */}
        <div style={{
          fontSize: apoioPx, fontWeight: 400,
          lineHeight: 1.65, color: TEXT_MID,
          maxWidth: 720, textAlign: 'center',
        }}>
          {apoio}
        </div>

      </div>

      {/* ── CTA fixo no rodapé ── */}
      <div style={{
        position: 'absolute', bottom: ctaBottom, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: isStory ? 20 : 17, fontWeight: 500, letterSpacing: '0.02em', color: GOLD }}>
            {cta}
          </span>
          <span style={{ fontSize: isStory ? 19 : 16, color: GOLD, opacity: 0.75 }}>→</span>
        </div>
        <div style={{
          height: 1, width: 260,
          backgroundImage: `linear-gradient(to right, transparent, rgba(184,149,42,0.6), transparent)`,
        }} />
      </div>

    </div>
  )
}
