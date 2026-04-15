'use client'

/**
 * TrackingProvider
 *
 * Componente client-side inserido no layout raiz.
 * Responsabilidades:
 *   1. Captura UTMs da URL no primeiro acesso e persiste em cookie (90 dias)
 *   2. Dispara PageView para Meta CAPI e GA4 em toda navegação
 *
 * Não renderiza nada — efeito puro.
 */

import { useEffect, useRef } from 'react'
import { captureUTMs } from '@/lib/utm'
import { trackEvent } from '@/lib/tracking'

export function TrackingProvider() {
  const firedRef = useRef(false)

  useEffect(() => {
    // Captura UTMs da URL e persiste no cookie (idempotente)
    captureUTMs()

    // Dispara PageView uma vez por montagem de componente (navegação de página)
    if (!firedRef.current) {
      firedRef.current = true
      trackEvent('PageView')
    }
  }, [])

  return null
}
