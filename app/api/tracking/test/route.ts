/**
 * GET /api/tracking/test
 *
 * Valida configuração de credenciais e dispara eventos de teste.
 * Use em desenvolvimento para verificar se Meta CAPI e GA4 estão funcionando.
 *
 * Meta: usa META_TEST_EVENT_CODE → visível no Events Manager → Test Events
 * GA4:  usa endpoint /debug/mp/collect → retorna validação detalhada
 *
 * ATENÇÃO: Remova ou proteja esta rota antes de ir para produção.
 */

import { NextResponse } from 'next/server'
import { sendMetaEvent } from '@/lib/server/meta-capi'
import { sendGA4Event }  from '@/lib/server/ga4-mp'

export async function GET() {
  const config = {
    meta: {
      pixel_id:         !!process.env.META_PIXEL_ID,
      access_token:     !!process.env.META_ACCESS_TOKEN,
      test_event_code:  process.env.META_TEST_EVENT_CODE ?? null,
    },
    ga4: {
      measurement_id: !!process.env.GA4_MEASUREMENT_ID,
      api_secret:     !!process.env.GA4_API_SECRET,
    },
    supabase: {
      url:              !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon_key:         !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  }

  const testEventId = `test-${Date.now()}`

  // Teste Meta CAPI
  const metaResult = await sendMetaEvent({
    eventName:      'PageView',
    eventId:        testEventId,
    eventSourceUrl: 'https://localhost:3000/api/tracking/test',
    userData: {
      email:     'test@example.com',
      clientIp:  '127.0.0.1',
    },
  })

  // Teste GA4 MP (usa debug endpoint para obter validação detalhada)
  const ga4Result = await sendGA4Event({
    eventName: 'page_view',
    clientId:  'test-client-id.123456789',
    debug:     true,
    params: {
      page_location: 'https://localhost:3000/api/tracking/test',
    },
  })

  return NextResponse.json({
    config,
    results: {
      meta: metaResult,
      ga4:  ga4Result,
    },
    instructions: {
      meta: 'Verifique o Test Events Tool no Meta Events Manager com o test_event_code acima.',
      ga4:  'O campo results.ga4.body mostra validações do GA4 DebugView.',
    },
  })
}
