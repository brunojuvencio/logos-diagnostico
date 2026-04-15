-- ============================================================
-- LOGOS DIAGNÓSTICO — Migration 001: Campos de tracking
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- Idempotente: usa ADD COLUMN IF NOT EXISTS
-- ============================================================

-- Contato obrigatório (novos leads terão sempre estes campos)
ALTER TABLE respostas
  ADD COLUMN IF NOT EXISTS email      text,
  ADD COLUMN IF NOT EXISTS whatsapp   text;  -- já existe como nullable; se não existir, cria

-- UTM Parameters
ALTER TABLE respostas
  ADD COLUMN IF NOT EXISTS utm_source   text,
  ADD COLUMN IF NOT EXISTS utm_medium   text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term     text,
  ADD COLUMN IF NOT EXISTS utm_content  text;

-- Identificadores de campanha
ALTER TABLE respostas
  ADD COLUMN IF NOT EXISTS gclid   text,
  ADD COLUMN IF NOT EXISTS fbclid  text;

-- Meta Pixel cookies (para match quality na CAPI)
ALTER TABLE respostas
  ADD COLUMN IF NOT EXISTS fbp  text,
  ADD COLUMN IF NOT EXISTS fbc  text;

-- Contexto de navegação
ALTER TABLE respostas
  ADD COLUMN IF NOT EXISTS page_url   text,
  ADD COLUMN IF NOT EXISTS referrer   text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS ip_address text;

-- ============================================================
-- Índices para análise de aquisição
-- ============================================================
CREATE INDEX IF NOT EXISTS respostas_utm_source_idx   ON respostas (utm_source);
CREATE INDEX IF NOT EXISTS respostas_utm_campaign_idx ON respostas (utm_campaign);
CREATE INDEX IF NOT EXISTS respostas_email_idx        ON respostas (email);

-- ============================================================
-- VERIFICAÇÃO — rode depois da migration para confirmar
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'respostas'
-- ORDER BY ordinal_position;
