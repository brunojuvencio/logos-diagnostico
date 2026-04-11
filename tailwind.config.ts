/**
 * LOGOS DESIGN SYSTEM — Tailwind v4 Config
 *
 * IMPORTANTE — Tailwind v4 usa configuração CSS-first.
 * Os tokens canônicos estão em styles/globals.css via @theme.
 * Este arquivo complementa com content paths e referências JS.
 *
 * Para ativar este arquivo, adicione ao styles/globals.css:
 *   @config "../tailwind.config.ts";
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.ts',
  ],

  theme: {
    extend: {
      // -----------------------------------------------------------------------
      // CORES — espelham os tokens do design.json
      // Em Tailwind v4, os valores canônicos vivem no @theme do globals.css.
      // Aqui servem como referência e para plugins/integrations JS.
      // -----------------------------------------------------------------------
      colors: {
        brand: {
          vespera:           '#1A1710',
          dourado:           '#B8952A',
          'dourado-claro':   '#D4AE4E',
          'dourado-faint':   '#F0E8CC',
          pergaminho:        '#F5F2EB',
          'pergaminho-escuro': '#EDE9DF',
          papel:             '#FDFCF8',
        },
        text: {
          primario:   '#0E0E0C',
          secundario: '#3A3830',
          terciario:  '#7A7668',
          desativado: '#C8C4B8',
          invertido:  '#FDFCF8',
          dourado:    '#B8952A',
        },
        semantic: {
          sucesso:        '#3B6D11',
          'sucesso-fundo': '#EAF3DE',
          aviso:           '#854F0B',
          'aviso-fundo':   '#FAEEDA',
          erro:            '#A32D2D',
          'erro-fundo':    '#FCEBEB',
          info:            '#0C447C',
          'info-fundo':    '#E6F1FB',
        },
      },

      // -----------------------------------------------------------------------
      // TIPOGRAFIA
      // -----------------------------------------------------------------------
      fontFamily: {
        display: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        body:    ["'DM Sans'", 'system-ui', 'sans-serif'],
      },

      // -----------------------------------------------------------------------
      // ESPAÇAMENTO — escala de 4px base
      // -----------------------------------------------------------------------
      spacing: {
        'logos-1':  '4px',
        'logos-2':  '8px',
        'logos-3':  '12px',
        'logos-4':  '16px',
        'logos-5':  '20px',
        'logos-6':  '24px',
        'logos-8':  '32px',
        'logos-10': '40px',
        'logos-12': '48px',
        'logos-16': '64px',
        'logos-20': '80px',
        'logos-24': '96px',
      },

      // -----------------------------------------------------------------------
      // BORDER RADIUS
      // -----------------------------------------------------------------------
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px',
      },

      // -----------------------------------------------------------------------
      // SOMBRAS
      // -----------------------------------------------------------------------
      boxShadow: {
        sm:   '0 1px 3px rgba(14,14,12,0.06)',
        md:   '0 4px 12px rgba(14,14,12,0.08)',
        lg:   '0 8px 24px rgba(14,14,12,0.10)',
        gold: '0 0 0 3px rgba(184,149,42,0.20)',
      },

      // -----------------------------------------------------------------------
      // MAX WIDTH (layout)
      // -----------------------------------------------------------------------
      maxWidth: {
        content: '720px',
        app:     '1200px',
      },

      // -----------------------------------------------------------------------
      // TRANSIÇÕES
      // -----------------------------------------------------------------------
      transitionDuration: {
        fast:    '120ms',
        default: '200ms',
        slow:    '350ms',
        page:    '500ms',
      },

      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        enter:   'cubic-bezier(0.0, 0.0, 0.2, 1)',
        exit:    'cubic-bezier(0.4, 0.0, 1, 1)',
      },

      // -----------------------------------------------------------------------
      // BREAKPOINTS
      // -----------------------------------------------------------------------
      screens: {
        tablet:  '768px',
        desktop: '1024px',
        wide:    '1280px',
      },
    },
  },
}

export default config
