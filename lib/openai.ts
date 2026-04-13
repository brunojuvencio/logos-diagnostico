/**
 * LOGOS DIAGNÓSTICO — OpenAI Client (server-side only)
 *
 * Importar APENAS em arquivos que rodam no servidor:
 *   - lib/diagnostico.ts
 *   - app/api/*
 *
 * NUNCA importar em componentes React ('use client') ou páginas client-side.
 */

import OpenAI from 'openai'

// Validação acontece em runtime (na API route), não no build.
// Um apiKey vazio fará a chamada falhar com erro de autenticação — comportamento esperado.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
})
