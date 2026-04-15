'use client'

/**
 * DiagnosticoTracking
 *
 * Componente client-side para a página /diagnostico/[id].
 * Disparado após o usuário completar o formulário e ver seu diagnóstico.
 *
 * Eventos disparados:
 *   Meta → CompleteRegistration
 *   GA4  → sign_up
 *
 * Recebe email e nome do Server Component para enriquecer o evento
 * com dados hasheados no servidor (melhor match quality).
 */

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/tracking'

interface Props {
  email?: string
  phone?: string
  firstName?: string
}

export function DiagnosticoTracking({ email, phone, firstName }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true

    trackEvent('CompleteRegistration', {
      email,
      phone,
      firstName,
      formName: 'diagnostico',
    })
  }, [email, phone, firstName])

  return null
}
