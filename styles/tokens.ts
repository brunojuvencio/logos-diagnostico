/**
 * LOGOS DESIGN SYSTEM — Tokens TypeScript
 * Fonte de verdade: design.json v1.0.0
 * NÃO editar valores manualmente — sincronizar com design.json
 */

// ---------------------------------------------------------------------------
// CORES
// ---------------------------------------------------------------------------

export const colorsBrand = {
  vespera:           '#1A1710',
  dourado:           '#B8952A',
  douradoClaro:      '#D4AE4E',
  douradoFaint:      '#F0E8CC',
  pergaminho:        '#F5F2EB',
  pergaminhoEscuro:  '#EDE9DF',
  papel:             '#FDFCF8',
} as const

export const colorsText = {
  primario:   '#0E0E0C',
  secundario: '#3A3830',
  terciario:  '#7A7668',
  desativado: '#C8C4B8',
  invertido:  '#FDFCF8',
  dourado:    '#B8952A',
} as const

export const colorsSemantic = {
  sucesso:      '#3B6D11',
  sucessoFundo: '#EAF3DE',
  aviso:        '#854F0B',
  avisoFundo:   '#FAEEDA',
  erro:         '#A32D2D',
  erroFundo:    '#FCEBEB',
  info:         '#0C447C',
  infoFundo:    '#E6F1FB',
} as const

export const colorsDarkMode = {
  fundoPrimario:   '#0E0D0A',
  fundoSecundario: '#1A1710',
  fundoTerciario:  '#242118',
  borda:           'rgba(184,149,42,0.15)',
  bordaEnfase:     'rgba(184,149,42,0.35)',
  textoPrimario:   '#F0EDE5',
  textoSecundario: '#B0AB9E',
  textoTerciario:  '#6E6A5E',
} as const

export const colorsBorder = {
  default:  'rgba(184,149,42,0.15)',
  hover:    'rgba(184,149,42,0.30)',
  focus:    'rgba(184,149,42,0.60)',
  emphasis: '#B8952A',
} as const

export const colors = {
  brand:    colorsBrand,
  text:     colorsText,
  semantic: colorsSemantic,
  darkMode: colorsDarkMode,
  border:   colorsBorder,
} as const

// ---------------------------------------------------------------------------
// TIPOGRAFIA
// ---------------------------------------------------------------------------

export const fontFamilies = {
  display: "'Cormorant Garamond', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
} as const

export const fontWeights = {
  light:   300,
  regular: 400,
  medium:  500,
  semibold: 600,
} as const

export const typeScale = {
  displayXl: {
    family:        fontFamilies.display,
    size:          '52px',
    weight:        300,
    lineHeight:    1.1,
    letterSpacing: '0.02em',
  },
  displayLg: {
    family:        fontFamilies.display,
    size:          '38px',
    weight:        300,
    lineHeight:    1.15,
    letterSpacing: '0.01em',
  },
  displayMd: {
    family:        fontFamilies.display,
    size:          '28px',
    weight:        400,
    lineHeight:    1.25,
    letterSpacing: '0',
  },
  displaySm: {
    family:        fontFamilies.display,
    size:          '20px',
    weight:        400,
    lineHeight:    1.4,
    letterSpacing: '0',
  },
  displayItalic: {
    family:     fontFamilies.display,
    size:       '18px',
    weight:     300,
    style:      'italic',
    lineHeight: 1.6,
  },
  bodyLg: {
    family:     fontFamilies.body,
    size:       '16px',
    weight:     400,
    lineHeight: 1.7,
  },
  bodyMd: {
    family:     fontFamilies.body,
    size:       '14px',
    weight:     400,
    lineHeight: 1.65,
  },
  bodySm: {
    family:     fontFamilies.body,
    size:       '13px',
    weight:     400,
    lineHeight: 1.6,
  },
  label: {
    family:        fontFamilies.body,
    size:          '11px',
    weight:        500,
    lineHeight:    1.4,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
  },
  micro: {
    family:        fontFamilies.body,
    size:          '10px',
    weight:        500,
    lineHeight:    1.4,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
  },
} as const

// ---------------------------------------------------------------------------
// ESPAÇAMENTO
// ---------------------------------------------------------------------------

export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

export const layout = {
  pagePaddingMobile:  '16px',
  pagePaddingTablet:  '24px',
  pagePaddingDesktop: '40px',
  maxWidthContent:    '720px',
  maxWidthApp:        '1200px',
} as const

// ---------------------------------------------------------------------------
// BORDER RADIUS
// ---------------------------------------------------------------------------

export const borderRadius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
} as const

// ---------------------------------------------------------------------------
// BORDAS
// ---------------------------------------------------------------------------

export const borderWidth = {
  thin:     '0.5px',
  default:  '1px',
  emphasis: '2px',
  accent:   '3px',
} as const

// ---------------------------------------------------------------------------
// SOMBRAS
// ---------------------------------------------------------------------------

export const shadows = {
  sm:   '0 1px 3px rgba(14,14,12,0.06)',
  md:   '0 4px 12px rgba(14,14,12,0.08)',
  lg:   '0 8px 24px rgba(14,14,12,0.10)',
  gold: '0 0 0 3px rgba(184,149,42,0.20)',
} as const

// ---------------------------------------------------------------------------
// MOTION
// ---------------------------------------------------------------------------

export const duration = {
  fast:    '120ms',
  default: '200ms',
  slow:    '350ms',
  page:    '500ms',
} as const

export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter:   'cubic-bezier(0.0, 0.0, 0.2, 1)',
  exit:    'cubic-bezier(0.4, 0.0, 1, 1)',
} as const

export const motion = { duration, easing } as const

// ---------------------------------------------------------------------------
// BREAKPOINTS
// ---------------------------------------------------------------------------

export const breakpoints = {
  mobile:  '0px',
  tablet:  '768px',
  desktop: '1024px',
  wide:    '1280px',
} as const

// ---------------------------------------------------------------------------
// EXPORT AGREGADO
// ---------------------------------------------------------------------------

export const tokens = {
  colors,
  fontFamilies,
  fontWeights,
  typeScale,
  spacing,
  layout,
  borderRadius,
  borderWidth,
  shadows,
  motion,
  breakpoints,
} as const

export type Tokens = typeof tokens
export type ColorBrand = keyof typeof colorsBrand
export type ColorText = keyof typeof colorsText
export type ColorSemantic = keyof typeof colorsSemantic
export type TypeScaleKey = keyof typeof typeScale
export type SpacingKey = keyof typeof spacing
export type BorderRadiusKey = keyof typeof borderRadius
export type ShadowKey = keyof typeof shadows
