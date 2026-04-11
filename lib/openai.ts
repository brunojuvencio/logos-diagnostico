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

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY não definida. Adicione ao .env.local.')
}

export const openai = new OpenAI({ apiKey })
