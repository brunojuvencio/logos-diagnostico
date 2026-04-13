/**
 * LOGOS DIAGNÓSTICO — Supabase Client
 *
 * Exporta dois clients:
 *   - `supabase`         → client anônimo tipado com Database, para uso no browser
 *   - `getSupabaseAdmin` → factory server-only com service role
 *
 * Usado em:
 *   - /api/submit           → getSupabaseAdmin() (insert)
 *   - /app/diagnostico/[id] → supabase (select por id)
 *   - /app/dashboard        → getSupabaseAdmin() (select agregado)
 */

import { createClient } from '@supabase/supabase-js'
import type { RespostaCompleta } from '@/types/pesquisa'

// ---------------------------------------------------------------------------
// Variáveis de ambiente — validadas em runtime
// ---------------------------------------------------------------------------

// Variáveis lidas em runtime; strings vazias fazem a chamada falhar com erro de auth
// em vez de quebrar o build. Configure as envs no painel do Vercel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ---------------------------------------------------------------------------
// Tipos do banco — mapeiam para as tabelas do Supabase
// ---------------------------------------------------------------------------

/**
 * Linha da tabela `respostas` como retornada pelo Supabase.
 * Inclui campos gerados pelo banco (id, created_at).
 */
export interface RespostaRow extends RespostaCompleta {
  id: string
  created_at: string
}

/**
 * Payload de insert — campos fornecidos pelo sistema antes de salvar.
 * `id` e `created_at` são gerados pelo Supabase.
 */
export type RespostaInsert = Omit<RespostaRow, 'id' | 'created_at'>

// ---------------------------------------------------------------------------
// Database type helper — compatível com `supabase gen types typescript` v2.103+
//
// A partir do @supabase/postgrest-js v1.19+, o GenericSchema exige que todos
// os campos abaixo estejam presentes; sem eles, os tipos das tabelas resolvem
// para `never` e o .insert() / .select() não aceita o payload.
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      respostas: {
        Row: RespostaRow
        Insert: RespostaInsert
        Update: Partial<RespostaInsert>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ---------------------------------------------------------------------------
// Client público — browser e Server Components sem privilégio elevado
// ---------------------------------------------------------------------------

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Client admin — apenas no servidor (API Routes / Server Actions)
// NUNCA importar este client em código client-side.
// ---------------------------------------------------------------------------

export function getSupabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida. Use apenas no servidor.')
  }
  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}

export type { RespostaCompleta }
