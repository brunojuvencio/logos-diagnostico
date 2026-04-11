'use client'

import { useState } from 'react'

interface OptionButtonProps {
  /** Texto principal da opção */
  label: string
  /** Descrição opcional abaixo do label */
  descricao?: string
  /** Estado de seleção */
  selected: boolean
  /** Callback de seleção */
  onSelect: () => void
  /** Modo multi-seleção (checkbox) ou seleção única (radio) */
  modo?: 'radio' | 'checkbox'
  /** Desabilitar a opção */
  disabled?: boolean
}

export function OptionButton({
  label,
  descricao,
  selected,
  onSelect,
  modo = 'radio',
  disabled = false,
}: OptionButtonProps) {
  const [hovered, setHovered] = useState(false)

  const bgColor = selected
    ? 'var(--logos-dourado-faint)'
    : hovered
    ? 'var(--logos-pergaminho-escuro)'
    : 'var(--logos-pergaminho)'

  const borderColor = selected
    ? 'var(--logos-border-emphasis)'
    : hovered
    ? 'var(--logos-tinta-faint)'
    : 'var(--logos-border)'

  const indicatorBorder = selected
    ? '2px solid var(--logos-dourado)'
    : hovered
    ? '1.5px solid var(--logos-tinta-light)'
    : '1.5px solid var(--logos-tinta-faint)'

  return (
    <button
      type="button"
      role={modo}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left"
    >
      {/* Container visual */}
      <div
        className="flex items-start gap-[var(--logos-space-4)] rounded-md overflow-hidden"
        style={{
          padding: 'var(--logos-space-4) var(--logos-space-5)',
          border: `var(--logos-border-width-default) solid ${borderColor}`,
          backgroundColor: bgColor,
          boxShadow: selected ? 'var(--logos-shadow-gold)' : 'none',
          opacity: disabled ? 0.45 : 1,
          transition: `
            background-color var(--logos-duration-default) var(--logos-ease-default),
            border-color var(--logos-duration-default) var(--logos-ease-default),
            box-shadow var(--logos-duration-default) var(--logos-ease-default)
          `,
        }}
      >
        {/* Indicador visual (radio / checkbox) */}
        <div
          className="shrink-0 mt-[2px]"
          style={{
            width: '16px',
            height: '16px',
            borderRadius: modo === 'radio' ? '9999px' : '4px',
            border: indicatorBorder,
            backgroundColor: selected ? 'var(--logos-dourado)' : 'transparent',
            transition: `
              background-color var(--logos-duration-fast) var(--logos-ease-default),
              border-color var(--logos-duration-fast) var(--logos-ease-default)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {selected && modo === 'radio' && (
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: 'var(--logos-vespera)',
              }}
            />
          )}
          {selected && modo === 'checkbox' && (
            <svg
              width="9"
              height="7"
              viewBox="0 0 9 7"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 3.5L3.5 6L8 1"
                stroke="var(--logos-vespera)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-[var(--logos-space-1)] min-w-0">
          <span
            className="font-body"
            style={{
              fontSize: '14px',
              fontWeight: selected ? 500 : 400,
              lineHeight: '1.4',
              color: selected
                ? 'var(--logos-tinta)'
                : hovered
                ? 'var(--logos-tinta-mid)'
                : 'var(--logos-tinta-light)',
              transition: `color var(--logos-duration-default) var(--logos-ease-default)`,
            }}
          >
            {label}
          </span>

          {descricao && (
            <span
              className="font-body"
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: 'var(--logos-tinta-light)',
              }}
            >
              {descricao}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
